const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { Requests, RequestItems ,EmailList } = this.entities;
  const db = await cds.connect.to('db');

  //Code for keeping the Status to New after Creating the request
  this.after('CREATE', Requests, async (data, req) => {
    await UPDATE(Requests)
      .set({ status: 'N' }) // 'N' represents 'New'
      .where({ requestid: data.requestid });
  
    console.log(`New request created with ID ${data.requestid}, status set to 'New'`);
  });

  //Code for calculating totalprice
  this.after(['CREATE', 'UPDATE'], 'Requests', async (req) => {
    const { requestid } = req;
    const items = req.requestitems || [];
    let totalprice = 0;
    items.forEach(item => {
    const quantity = parseFloat(item.Quantity || 0);
    const unitsPrice = parseFloat(item.ItemPrice || 0);

    item.ItemPrice = quantity * unitsPrice;
    totalprice += item.ItemPrice;
   });

    // Update the totalPrice
    await UPDATE(Requests)
      .set({ totalprice })
      .where({ requestid });

    console.log(`Updated totalPrice for headerID ${requestid}: ${totalprice}`);
  });

  //Auto Increment the RequestID
  this.before('CREATE', 'Requests', async (req) => {
    
      if (req.data.IsActiveEntity === false) return;
      
      try {
          const lastRequest = await db.run(
              SELECT.one.from(Requests).columns('requestid').orderBy('requestid desc')
          );

          req.data.requestid = lastRequest && lastRequest.requestid ? lastRequest.requestid + 1 : 1;
          console.log("Generated requestid:", req.data.requestid);
          
      } catch (error) {
          console.error("Error generating requestid:", error);
          req.reject(500, "Failed to generate requestid");
      }
  });

  //Choosing Approvers 
  this.on('approverSelection', async req => {
      let value = req.data.totalPrice;

      try {
          const result = await findApprovers(value);
          return result;
      } catch (error) {
          console.error("Error fetching approvers:", error);
          return [{ email: 'none', level: 0 }];
      }
  });
  async function findApprovers(value) {
     
      const approvers = await SELECT.from(EmailList)
                                    .where({ approvalValue: { '<=': value } })
                                    .orderBy('approvalValue asc');
     
      if (approvers.length > 0) {
          return approvers;
      } else {
          return [{ email: 'none',
              approvalValue: 0, }];
      }
  }

    // Action for send for approval
    this.on('sendforapproval', async (req) => {
      const requestId = req.params[0].requestid;  
  
      console.log('Request ID:', requestId);
  
      try {
        await UPDATE(Requests)
          .set({ status: 'P' })
          .where({ requestid: requestId });
  
        console.log(`Request ID ${requestId} status updated to 'In Approval'`);
  
        // Fetch Request Header
        const payload_bpa_header = await SELECT.one.from(Requests).where({ requestid: requestId });
        
        if (!payload_bpa_header) {
          return req.reject(404, `Request ID ${requestId} not found`);
        }
  
        // Fetch Request Items (Fixing Association Filtering)
        const payload_bpa_items = await SELECT.from(RequestItems).where({ Request_requestid: requestId });
  
        const product_api = await cds.connect.to('WFDestination');
  
        let payload = {
          "definitionId": "us10.buyerportalpoc-aeew31u1.requestorder.orderProcesssing",
          //"definitionId": "us10.buyerportalpoc-aeew31u1.processrequestorder2.orderProcesssing",
          "context": {
              "requests": {
                "Request": {
                "requestid": payload_bpa_header.requestid,
                "requestno": payload_bpa_header.requestno,
                "requestdesc": payload_bpa_header.requestdesc,
                "requestby": payload_bpa_header.requestby,
                "totalprice": payload_bpa_header.totalprice,
                "requestitems": payload_bpa_items.map(item => ({
                  "ItemPrice": item.ItemPrice,
                  "Quantity": item.Quantity,
                  "Material": item.Material,
                  "Plant": item.Plant,
                  "ItemNo": item.ItemNo,
                  "ItemDesc": item.ItemDesc
                }))
              }
          }
        }
        };
        let oResult = await product_api.tx(req).post('/workflow/rest/v1/workflow-instances', payload);
        console.log("Workflow Response:", oResult);
        req.reply({ message: "Approval process initiated successfully!" });
  
      } catch (error) {
        console.error('Error triggering workflow:', error);
        req.reject({ message: `Error: ${error.message}` });
      }
    });
    
    // Approve Request Action
    this.on('approveRequest', async (req) => {
  try {
      const { requestid } = req.data;
      if (!requestid) return req.error(400, "Missing headerID");

      const entity = "my.company.Requests";
      console.log("triggering")
      // Check if the record exists
      const result = await db.run(SELECT.from(entity).where({ requestid }));
      if (result.length === 0) {
          return req.error(404, "Request not found");
      }

      // Update status
      await db.run(UPDATE(entity).set({ status: 'A' }).where({ requestid }));

      return requestid;

  } catch (error) {
      return req.error(500, "Approval failed", { error: error.message });
  }
    });

    // Reject Request Action
    this.on('rejectRequest', async (req) => {
  try {
      const { requestid } = req.data;
      if (!requestid) return req.error(400, "Missing headerID");

      const entity = "my.company.Requests";

      // Check if the record exists
      const result = await db.run(SELECT.from(entity).where({ requestid }));
      if (!result || result.length === 0) {
          return req.error(404, `Request with ID ${requestid} not found`);
      }

      // Update status to 'Rejected'
      await db.run(UPDATE(entity).set({ status: 'X' }).where({ requestid }));

      return requestid;

  } catch (error) {
      return req.error(500, "Rejection failed", { error: error.message });
  }
    });

    // event handler for data coming from BPA

    this.on('datafrombpa', async (req) => {
      console.log("Received Status:", req.data.status);
      if (req.data.status !== 'A' && req.data.status !== 'X') {
          console.log("Invalid status received. Expected 'A' or 'X'.");
          return;
      }
      await UPDATE(Requests)
          .set({ status: req.data.status })
          .where({ requestid: req.data.requestid });
      console.log("Status updated to:", req.data.status);
  });


  this.on('PATCH', 'RequestItems', async (req) => {
    try {
        console.log("🔥 Patch Request Received:", JSON.stringify(req.data, null, 2));

        if (!req.data.ItemNo) throw new Error("❌ Missing ItemNo");

        const affectedRows = await UPDATE(RequestItems)
            .set({
                ItemDesc: req.data.ItemDesc,
                Quantity: req.data.Quantity,
                ItemPrice: req.data.ItemPrice,
                Material: req.data.Material,
                Plant: req.data.Plant
            })
            .where({ ItemNo: req.data.ItemNo });

        console.log(`✅ Updated ${affectedRows} rows for ItemNo ${req.data.ItemNo}`);

        return { success: true };
    } catch (error) {
        console.error("❌ Error in PATCH RequestItems:", error.message);
        return { error: error.message };
    }
});

  
this.on('EditRequestItems', async (req) => {
    try {
        const { requestid } = req.data;
        if (!requestid) return req.error(400, "Missing requestid");

        const db = cds.transaction(req);

        console.log("Fetching approved request items for requestid:", requestid);

        // Fetch all related request items
        const requestItems = await db.run(
            SELECT.from('my.company.RequestItems').where({ Request_requestid: requestid })
        );

        if (!requestItems.length) {
            return req.error(404, "No request items found for the given requestid");
        }

        return requestItems;

    } catch (error) {
        console.error("Error fetching request items:", error);
        return req.error(500, "Failed to retrieve request items", { error: error.message });
    }
});


this.on('GetRequestItems', async (req) => {
    try {
        const { requestid } = req.data; // Get requestid from query params

        if (!requestid) return req.error(400, "Missing requestid");

        console.log("Fetching request items for requestid:", requestid);

      //  const db = cds.transaction(req);

        // Fetch request items based on requestid
        const requestItems = await db.run(
            SELECT.from('my.company.RequestItems')
                .columns('ItemNo', 'Request_requestid', 'ItemDesc', 'Quantity', 'ItemPrice', 'Material', 'Plant')
                .where({ Request_requestid: requestid })
        );

        if (!requestItems.length) {
            return req.error(404, "No request items found for the given requestid");
        }

        return requestItems;

    } catch (error) {
        console.error("Error fetching request items:", error);
        return req.error(500, "Failed to retrieve request items", { error: error.message });
    }
});


this.on('updateRequestItems', async (req) => {
    console.log("Received Status:", req.data.status);
  
    if (req.data.status !== 'A' && req.data.status !== 'X') {
        console.log("Invalid status received. Expected 'A' or 'X'.");
        return;
    }
  
    // Update the Request status
    await UPDATE(Requests)
        .set({ status: req.data.status })
        .where({ requestid: req.data.requestid });
  
    console.log(`Status updated to: ${req.data.status} for request ID: ${req.data.requestid}`);
  
    // Update request items if present
    if (req.data.requestitems && req.data.requestitems.length > 0) {
        for (const item of req.data.requestitems) {
            await UPSERT.into(RequestItems).entries({
                ItemNo: item.ItemNo,
                ItemDesc: item.ItemDesc,
                Quantity: item.Quantity,
                ItemPrice: item.ItemPrice,
                Material: item.Material,
                Plant: item.Plant,
                Request_requestid: req.data.requestid // Ensure correct foreign key
            });
        }
        console.log(`Request items upserted for request ID: ${req.data.requestid}`);
    }
  
    // Fetch and return the updated data to the UI
    const updatedRequest = await SELECT.one.from(Requests)
        .where({ requestid: req.data.requestid });
  
    const updatedItems = await SELECT.from(RequestItems)
        .where({ Request_requestid: req.data.requestid });
  
    return {
        requestid: updatedRequest.requestid,
        status: updatedRequest.status,
        requestitems: updatedItems
    };
  });
});