using PurchaseApproval as service from '../../srv/service';

annotate service.Requests with @(
   //Common.DefaultValuesFunction : 'getOrderDefaults',
    UI.FieldGroup #GeneralInfo : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Request ID',
                Value : requestid
            },
            {
                $Type : 'UI.DataField',
                Label : 'Request No',
                Value : requestno
            },
            {
                $Type : 'UI.DataField',
                Label : 'Description',
                Value : requestdesc
            },
            /* {
                $Type : 'UI.DataFieldForAction',
                Action : 'PurchaseApproval.sendforApproval',
                Label : 'Send For Approval'
            }, */
            {
                $Type : 'UI.DataField',
                Label : 'Requested By',
                Value : requestby
            },
            {
                $Type : 'UI.DataField',
                Label : 'Total Price',
                Value : totalprice
            },
            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status
            }
        ]
    },

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneralInfoFacet',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneralInfo'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Request Items',
            Target : 'requestitems/@UI.LineItem'
        }
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Request ID',
            Value : requestid
        },
        {
            $Type : 'UI.DataField',
            Label : 'Request No',
            Value : requestno
        },
        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : requestdesc
        },
        {
            $Type : 'UI.DataField',
            Label : 'Requested By',
            Value : requestby
        },
        {
            $Type : 'UI.DataField',
            Label : 'Total Price',
            Value : totalprice
        },
            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status,
            }
    ]
);

annotate service.RequestItems with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Item No',
            Value : ItemNo
        },
        {
            $Type : 'UI.DataField',
            Label : 'Item Description',
            Value : ItemDesc
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantity',
            Value : Quantity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Item Price',
            Value : ItemPrice
        },
        {
            $Type : 'UI.DataField',
            Label : 'Material',
            Value : Material
        },
        {
            $Type : 'UI.DataField',
            Label : 'Plant',
            Value : Plant
        }
    ],

    UI.HeaderInfo : {
        TypeName : 'Request Item',
        TypeNamePlural: 'Request Items',
        Title : { Value: ItemNo },
        Description: { Value: ItemDesc }
    },

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'More Info',
            Target : '@UI.Identification'
        }
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataField',
            Label : 'Item No',
            Value : ItemNo
        },
        {
            $Type : 'UI.DataField',
            Label : 'Item Description',
            Value : ItemDesc
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantity',
            Value : Quantity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Item Price',
            Value : ItemPrice
        },
        {
            $Type : 'UI.DataField',
            Label : 'Material',
            Value : Material
        },
        {
            $Type : 'UI.DataField',
            Label : 'Plant',
            Value : Plant
        }
    ]
);
