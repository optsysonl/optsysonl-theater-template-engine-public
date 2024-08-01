define(['text!templates/Concession.html',
        'text!templates/ConcessionDialog.html',
        'text!templates/ConcessionItemsView.html',
        'text!templates/ConcessionMultipleItems.html',
        'collections/productCollection',
        'views/_purchaseSummary',
        'models/concessionModel',
        'helpers/CountdownHelper'
], function (template, templateDialog, concessionItemsView, concessionMultipleItems, productCollection, purchaseSummaryView, concessionModel) {

    var view = Backbone.View.extend({
        template: _.template(template),
        templateDialog: _.template(templateDialog),
        concessionItemsTemplate: _.template(concessionItemsView),
        templateConcessionMultipleItems: _.template(concessionMultipleItems),
        initialize: function () {
            _.bindAll(this);

            window.concessions = new Object();
            window.concessions.selectedItems = [];
        },
        events: {
            "click .concessionMenuItem": "showMenuItem",
            "click .product": "addProduct",
            "click .combo-group > .concessionsItem > .concession-item": "selectModifier",
            "click #btn-concession-save": "addProductToSummary",
            "click #btn-concessions-continue": "concessionsContinue"
        },
        loadPurchaseSummary: function (addedItem) {
            if (!window.ObjectViews.PurchaseSummaryView) {
                window.ObjectViews.PurchaseSummaryView = new purchaseSummaryView();
            }
            window.ObjectViews.PurchaseSummaryView.render({ container: '#purchaseSummaryConcession', step: 'concession', localize: window.ObjectCollections.Localization.result, vent: this.vent });
            if (addedItem) {
                this.summaryItemHighlight(addedItem);
                window.ObjectModels.TempOrder.concessionsChanged = true;
            }
        },
        renderConcessionItems: function () {
            $('#concession-items').html(this.concessionItemsTemplate({ model: this.model }));
        },
        render: function (arg) {
            window.onscroll = function () {
                $('#concession-modal').css({
                    'position': 'absolute',
                    'left': 0,
                    'right': 0,
                    'margin': 'auto'
                });
            };

            try {
                this.undelegateEvents();

                this.vent = arg.vent;
                this.vent.bind('concessionsContinue', this.concessionsContinue);
                this.vent.bind('removeConcessionItem', this.removeConcessionItem);

                if (window.ObjectModels.TempOrder.concessions) {
                    window.ObjectModels.OrderModel.set('concessions', window.ObjectModels.TempOrder.concessions);
                    window.ObjectModels.OrderModel.set('totalPrice', window.ObjectModels.TempOrder.total);
                    window.ObjectModels.OrderModel.set('subTotal', window.ObjectModels.TempOrder.subTotal);
                }

                if (arg) {
                    this.message = arg.message;
                    this.model = arg.model;
                    this.container = arg.container;
                }

                showPageLoadingMessage();
                // First time? Select first item menu
                if (!this.model.selectedProducts)
                    this.productsToShow(_.first(this.model.models).get('name'));

                this.$el.html(this.template({ model: this.model, localize: this.options.localize, message: this.message }));
                $(this.container).empty().append(this.$el);

                this.renderConcessionItems();
                this.loadPurchaseSummary();
                this.delegateEvents();

                var newItem = $('.concession-summary-item.new');
                if (newItem) {
                    var product = _.find(this.model.selectedItems, function (item) { return item.id == newItem.data('id'); });
                    if (product)
                        product.status = 'old';

                    newItem.animate({ opacity: 0.5 }, 3000, function () {
                        newItem.css('color', 'black');
                        newItem.animate({ opacity: 1 }, 1000);
                    });
                }
            }
            catch (er) {
                this.el = er.message;
                $(arg.container).html(this.el);
            }

            hidePageLoadingMessage();
            CountdownHelper.initCountdown();
        },
        productsToShow: function (menuItemName) {
            var that = this;
            var menuItem = _.find(that.model.models, function (product) { return product.get('name') == menuItemName; });

            that.model.category = menuItemName;

            var products = new productCollection();
            if (menuItem) {
                _.each(menuItem.get('products'), function (productId) {
                    products.push(that.model.products.get(productId));
                });
            }

            products.comparator = function (product) {
                return product.get("name");
            };
            products.sort();

            that.model.selectedProducts = products;
        },
        showMenuItem: function (e) {
            e.preventDefault();
            $('.concession-navigation li.active').removeClass('active');
            var that = this;
            that.productsToShow(decodeURIComponent(e.currentTarget.id));
            that.renderConcessionItems();
            $($(e.currentTarget).parent()).addClass('active');
        },
        getGuid: function () {
            var rNumber = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (rNumber() + rNumber() + '-' + rNumber() + '-' + rNumber() + '-' + rNumber() + '-' + rNumber() + rNumber() + rNumber());
        },
        addProduct: function (e) {
            var that = this;
            var target = $(e.currentTarget);

            var productId = target.data('id');
            var product = that.model.products.get(productId);

            that.model.selectedProduct = null;
            window.selectedConcession = { concessionItemId: that.getGuid(), productId: product.get('id'), name: product.get('name'), price: product.get('price'), quantity: 1 };

            if ((product.get('modifiers') && product.get('modifiers').length > 0) || (product.get('comboItems') && product.get('comboItems').length > 0)) {
                that.model.selectedProduct = product;
                that.startMultipleItemsFlow();
            } else {
                var callback = function () {
                    window.ObjectModels.OrderModel.get('concessions').add(new concessionModel(window.selectedConcession));
                    that.loadPurchaseSummary(productId);
                };
                that.addItemToSummary(productId, [], callback);
            }
        },
        selectModifier: function (e) {
            var target = $(e.currentTarget);
            var selectedItems = $('.combo-group').find('.concession-item-selected');
            var maxNumberOfModifiers = $('.combo-group').data('max-number-of-modifiers');
            var requiredNumberOfModifiers = $('.combo-group').data('required-number-of-modifiers');
            if (target.hasClass('concession-item-selected')) {
                if (requiredNumberOfModifiers == 1 && maxNumberOfModifiers == 1)
                    return;

                target.removeClass('concession-item-selected');
            }
            else {
                if (maxNumberOfModifiers > 0 && selectedItems.length > maxNumberOfModifiers - 1)
                    $(selectedItems[selectedItems.length - 1]).removeClass('concession-item-selected');
                target.addClass('concession-item-selected');
            }
        },
        summaryItemHighlight: function (itemId) {
            var item = $('[data-id=' + itemId + ']:last');
            item.addClass('branded-text');
            setTimeout(function () {
                item.removeClass('branded-text');
            }, 1000);
        },
        addItemToSummary: function (productId, modifiers, callback) {
            var that = this;
            var product = null;

            if (productId) {
                var tempProduct = that.model.products.get(productId);
                product = { productId: tempProduct.get('id'), name: tempProduct.get('name'), price: tempProduct.get('price'), quantity: 1, modifiers: modifiers };
            }

            if (window.selectedConcession && that.model.selectedProduct) {
                if (that.model.selectedProduct.get('comboItems') && that.model.selectedProduct.get('comboItems').length > 0) {
                    if (!window.selectedConcession.comboItems)
                        window.selectedConcession.comboItems = [];
                    window.selectedConcession.comboItems.push(product);
                }

                if (that.model.selectedProduct.get('modifiers') && that.model.selectedProduct.get('modifiers').length > 0) {
                    window.selectedConcession.modifiers = modifiers;
                }
            }

            if (callback)
                callback();
        },
        addProductToSummary: function () {
            var that = this;
            if (that.nextButtonDisabled) {
                return false;
            }
            that.nextButtonDisabled = true;
            setTimeout(function () {
                if (that.modifiersCounter > 0) {
                    var selectedModifiers = [];

                    $('.concession-item-selected').each(function () {
                        selectedModifiers.push($(this).data('id'));
                    });


                    var selectedItem = window.selectedConcession;

                    if (that.comboItemsCounter > 0) {
                        selectedItem = window.selectedConcession.comboItems[window.selectedConcession.comboItems.length - 1];
                        if (!selectedItem.modifiers) selectedItem.modifiers = [];
                    }

                    that.addModifiers(selectedModifiers, selectedItem);

                } else if (that.comboItemsCounter > 0) {
                    var comboItemId = $('.concession-item-selected').data('id');
                    that.selectComboItem(comboItemId);
                }
                that.nextButtonDisabled = false;
            }, 400);
        },
        removeConcessionItem: function (itemToRemove, callback) {
            var concessions = window.ObjectModels.OrderModel.get('concessions');
            var productToRemove = _.last(concessions.where({ concessionItemId: itemToRemove }));

            if (productToRemove) {
                window.ObjectModels.TempOrder.concessionsChanged = true;

                var quantity = productToRemove.get('quantity');
                if (quantity > 1) {
                    var product = this.model.products.get(productToRemove.get('productId'));
                    var req = product.get('requiredNumberOfModifiers') || (product.get('modifiers') && product.get('modifiers').length > 0 ? product.get('modifiers')[0].requiredNumberOfModifiers : 0);
                    var max = product.get('maxNumberOfModifiers') || (product.get('modifiers') && product.get('modifiers').length > 0 ? product.get('modifiers')[0].maxNumberOfModifiers : 0);
                    if (req === 1 && max === 1) {
                        var modifiers = productToRemove.get('modifiers');
                        modifiers.splice(modifiers.length - 1, 1);
                    }
                    productToRemove.set('quantity', quantity - 1);
                } else {
                    var productIndex = _.lastIndexOf(concessions.models, productToRemove);
                    concessions.models.splice(productIndex, 1);
                }

                if (callback) {
                    callback();
                }
            }
        },
        concessionsContinue: function () {
            var currentTab = $('#checkout-menu>li:first.active'),
               currentTabName = currentTab.data('tab-name');

            if (currentTabName != 'concessions')
                return;

            this.vent.trigger('showNextPage', {
                callback: function () {
                }
            });
        },
        startMultipleItemsFlow: function () {
            var that = this;
            that.nextButtonDisabled = false;
            $('.concession-dialog').html(that.templateDialog({ headerTitle: that.model.selectedProduct.get('name') }));
            $('#concession-modal').modal().on('shown', function () {
                $(this).find('.modal-body').scrollTop(0);
            });
            $('#concession-modal').modal().on('hidden', function () {
                that.modifiersCounter = 0;
                that.comboItemsCounter = 0;
                that.currentComboItemQuantity = null;
                window.selectedConcession = null;

                $('.modal-body').empty();
            });

            if (that.model.selectedProduct.get('comboItems').length > 0) {
                that.comboItemsCounter = 1;

                window.selectedConcession = { concessionItemId: that.getGuid(), productId: that.model.selectedProduct.get('id'), name: that.model.selectedProduct.get('name'), price: that.model.selectedProduct.get('price'), quantity: 1 };
                window.selectedConcession.comboItems = [];

                that.fillComboItems();
            } else {
                that.modifiersCounter = 1;

                window.selectedConcession = { concessionItemId: that.getGuid(), productId: that.model.selectedProduct.get('id'), name: that.model.selectedProduct.get('name'), price: that.model.selectedProduct.get('price'), quantity: 1 };
                window.selectedConcession.modifiers = [];

                that.fillModifiers(that.model.selectedProduct);
            }
        },
        getProductsDetails: function (products) {
            var that = this;
            var result = [];
            _.each(products, function (p) {
                var main = that.model.products.get(p.productId);

                for (var property in main.attributes) {
                    if (property != 'id' && !p.hasOwnProperty(property)) {
                        p[property] = main.attributes[property];
                    }
                }
                result.push(new Object(JSON.parse(JSON.stringify(p))));
            });

            return result;
        },
        addModifiers: function (modifierIds, parent) {
            var that = this;
            var selectedProduct = that.model.products.get(parent.productId);
            var modifiers = [];
            _.each(modifierIds, function (mid) {
                var selectedModifier = _.find(selectedProduct.get('modifiers')[that.modifiersCounter - 1].modifierItems, function (m) {
                    return m.productId == mid;
                });

                modifiers.push({
                    productId: selectedModifier.productId,
                    quantity: 1,
                    price: selectedModifier.price
                });
            });

            parent.modifiers = parent.modifiers.concat(that.getProductsDetails(modifiers));
            that.modifiersCounter++;

            that.fillModifiers(selectedProduct);
        },
        fillModifiers: function (selectedProduct, parentName) {
            var that = this;

            if (selectedProduct.get('modifiers').length >= that.modifiersCounter) {
                var modifierItems = selectedProduct.get('modifiers')[that.modifiersCounter - 1].modifierItems;

                var modifiers = that.getProductsDetails(modifierItems);


                var selectOptionsMessage = selectedProduct.get('modifiers')[that.modifiersCounter - 1].name;

                that.sortItems(modifiers);

                that.animateTransition(that.templateConcessionMultipleItems({
                    products: modifiers,
                    selectOptionsMessage: selectOptionsMessage,
                    parentName: parentName || null,
                    culture: that.options.culture,
                    requiredNumberOfModifiers: selectedProduct.get('modifiers')[that.modifiersCounter - 1].requiredNumberOfModifiers,
                    maxNumberOfModifiers: selectedProduct.get('modifiers')[that.modifiersCounter - 1].maxNumberOfModifiers
                }));
            } else if (!that.comboItemsCounter || that.comboItemsCounter == 0) {
                window.ObjectModels.OrderModel.get('concessions').add(new concessionModel(window.selectedConcession));
                that.loadPurchaseSummary(window.selectedConcession.productId);

                $('#concession-modal').modal('hide');
            } else {
                if (that.checkCurrentComboQuantity() == 0)
                    that.comboItemsCounter++;

                that.modifiersCounter = 0;
                that.fillComboItems();
            }
        },
        fillComboItems: function () {
            var that = this;

            if (that.model.selectedProduct.get('comboItems').length >= that.comboItemsCounter) {
                var nextComboItem = that.model.selectedProduct.get('comboItems')[that.comboItemsCounter - 1];
                var comboItemsIds = [];
                _.each(nextComboItem.products, function (p) {
                    comboItemsIds.push({ productId: p });
                });
                var selectOptionsMessage = $.sprintf(window.ObjectCollections.Localization.result.selectYourOptionsForCombo, that.model.selectedProduct.get('name'));

                if (!that.currentComboItemQuantity)
                    that.currentComboItemQuantity = nextComboItem.quantity;

                if (nextComboItem.products.length == 1) {
                    var product = that.model.products.get(nextComboItem.products[0]);
                    if (product.get('modifiers').length > 0) {
                        that.selectComboItem(product.get('id'));
                        return;
                    }
                }

                var comboItems = that.getProductsDetails(comboItemsIds);
                _.each(comboItems, function (c) {
                    c.price = 0;
                });
                that.sortItems(comboItems);

                that.animateTransition(that.templateConcessionMultipleItems({
                    products: comboItems,
                    selectOptionsMessage: selectOptionsMessage,
                    parentName: null,
                    culture: that.options.culture,
                    requiredNumberOfModifiers: 1,
                    maxNumberOfModifiers: 1
                }));
            } else {
                window.ObjectModels.OrderModel.get('concessions').add(new concessionModel(window.selectedConcession));
                that.loadPurchaseSummary(window.selectedConcession.productId);

                $('#concession-modal').modal('hide');
            }
        },
        selectComboItem: function (itemId) {
            var that = this;
            var selectedComboItem = that.model.products.get(itemId);
            window.selectedConcession.comboItems.push({
                productId: selectedComboItem.get('id'),
                quantity: 1,
                name: selectedComboItem.get('name'),
                price: selectedComboItem.get('price')
            });

            if (selectedComboItem.get('modifiers').length > 0) {
                that.modifiersCounter = 1;
                that.fillModifiers(selectedComboItem, selectedComboItem.get('name'));
            } else {
                if (that.checkCurrentComboQuantity() == 0)
                    that.comboItemsCounter++;

                that.fillComboItems();
            }
        },
        checkCurrentComboQuantity: function () {
            var that = this;
            var currentComboItemQuantity = 0;

            if (that.currentComboItemQuantity) {
                that.currentComboItemQuantity--;

                if (that.currentComboItemQuantity == 0) {
                    that.currentComboItemQuantity = null;
                    currentComboItemQuantity = 0;
                } else
                    currentComboItemQuantity = that.currentComboItemQuantity;
            }
            return currentComboItemQuantity;
        },
        sortItems: function (items) {
            items.sort(function (left, right) {
                if (left.name < right.name)
                    return -1;
                if (left.name > right.name)
                    return 1;
                return 0;
            });
        },
        // Use this to load next modifiers/combos view
        animateTransition: function (nextView) {
            var comboGroupContainer = $('.combo-group');
            if (comboGroupContainer.length > 0) {
                $('.combo-group').hide('slide', { direction: 'left' }, 200, function () {
                    $('.concession-dialog .modal-body').empty().html(nextView);
                    $('.combo-group').show('slide', { direction: 'right' }, 200);
                });
                ;
            } else {
                $('.concession-dialog .modal-body').empty().html(nextView);
                $('.combo-group').show();
            }
        },
        destroyView: function () {
            if (this.purchaseSummaryView) {
                this.purchaseSummaryView.destroyView();
                this.purchaseSummaryView = null;
            }
            this.undelegateEvents();
            $(this.el).removeData().unbind();
            this.unbind();
            this.remove();
            Backbone.View.prototype.remove.call(this);
        },
        dispose: function () {
            this.undelegateEvents();
            this.off();
            if (this.vent)
                this.vent.off();
        }
    });

    return view;
});