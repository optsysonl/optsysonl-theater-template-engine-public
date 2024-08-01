define(["models/productModel"], function (ProductModel) {
    window.ProductCollection = BaseCollection.extend({
        model: ProductModel,
        initialize: function (arg) {
        }
    });

    return window.ProductCollection;
});