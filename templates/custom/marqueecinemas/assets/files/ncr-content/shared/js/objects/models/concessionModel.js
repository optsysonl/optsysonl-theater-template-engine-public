define([], function () {

    window.ConcessionModel = BaseModel.extend({
        initialize: function () {

        },
        calculateTotalPrice: function(){
        	return this.get('quantity') * this.get('price');
        }
    });

    return window.ConcessionModel;

});