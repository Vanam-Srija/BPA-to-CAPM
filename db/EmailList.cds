namespace my.company;

entity EmailList {
    key ID : Integer;
    email : String;
    name : String;
    approvalValue : Integer;
}

entity Requests {
    key requestid  : Integer;
    requestno      : String;
    requestdesc    : String;
    requestby      : String;
    totalprice     : Integer @readonly;
    status         : String;
    requestitems   : Composition of many RequestItems on requestitems.Request_requestid = requestid;
}

entity RequestItems {
    key ItemNo           : Integer;
    key Request_requestid: Integer;  // ✅ Ensure uniqueness per request
    ItemDesc             : String;
    Quantity             : Integer;
    ItemPrice            : Integer;
    Material             : String;
    Plant                : String;
    Request              : Association to Requests on Request_requestid = Request.requestid;
}
