sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'sricapm1.project1',
            componentId: 'RequestItemsObjectPage',
            contextPath: '/Requests/requestitems'
        },
        CustomPageDefinitions
    );
});