define([], function () {
    window.PurchaseTicketModel = BaseModel.extend({
        idAttribute: "saleId",
        
        initialize: function (attributes) {
        },
        
        url: function() {
        	if(this.saleId) {
        		return this.RESTUri + 'theaters/' + this.theaterId + '/sales/' + this.saleId + '/' + this.performanceNumber + '/tickets';
        	} else {
        	    return this.RESTUri + 'theaters/' + this.theaterId + '/sales/' + this.performanceNumber + '/tickets';
        	}
        }
    });

    return window.PurchaseTicketModel;
});
