sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sricapm1/project1/test/integration/FirstJourney',
		'sricapm1/project1/test/integration/pages/RequestsList',
		'sricapm1/project1/test/integration/pages/RequestsObjectPage',
		'sricapm1/project1/test/integration/pages/RequestItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, RequestsList, RequestsObjectPage, RequestItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sricapm1/project1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheRequestsList: RequestsList,
					onTheRequestsObjectPage: RequestsObjectPage,
					onTheRequestItemsObjectPage: RequestItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);