sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

 /*    return {
        ApprovalSendingMethod: function(oEvent) {
            MessageToast.show("Custom handler invoked.");
        }
    }; */

    return {

        ApprovalSendingMethod: function(oEvent) {

            var that = this;

            var oDataModel = this.getBindingContext().getModel()

            const sPath = oDataModel.sServiceUrl + that.getBindingContext().sPath.slice(1, that.getBindingContext().sPath.length) + "/sendforapproval";
 
            $.ajax({

                url: sPath,

                async: false,

                headers : {

                    'X-CSRF-Token' : oDataModel.getHttpHeaders()["X-CSRF-Token"]

                },

                type: "POST",

                dataType: "json",

                contentType: "application/json",

                success: function (json) {

                    MessageToast.show("Approval Request initiated successfully");

                    // window.location.reload(); 

                    that.getBindingContext().refresh()

                    // refreshing the model 

                    that.getModel().refresh()

                },

                error: function (error) {

                    // Handle the error scenario
                    console.log("error");

/*                     MessageToast.error("Failed to add comment: " + error);
 */
                },complete: function(xhr, status) {

            } });
 
        }

    };
});

 
