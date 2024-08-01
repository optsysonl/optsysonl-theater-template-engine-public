define(['models/performanceModel'], function (PerformanceModel) {

    window.PerformanceCollection = BaseCollection.extend({
        model: PerformanceModel,

        initialize: function () {
        },
        getShowTimeOptions: function(args)
        {
            var scheduleOptions = args.scheduleOptions,
                showTimeOptions = args.showTimeOptions;

            _.each(this.models, function (performance, j) {

                if (!performance.get('passesAllowed') && scheduleOptions.passesAllowed){
                    scheduleOptions.passesAllowed = false;
                }
                if (!performance.get('isReservedSeating') && scheduleOptions.reservedSeating){
                    scheduleOptions.reservedSeating = false;
                }
                if(showTimeOptions !== undefined){
                    if (performance.get('isReservedSeating')){
                        showTimeOptions.reservedSeating = true;
                    }
                }
            });
        }
        
    });

    return window.PerformanceCollection;
});