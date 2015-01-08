(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['backbone','underscore','jquery'], factory);
	} else {
		// Browser globals
		root.CollectionView = factory(root.Backbone,root._,root.jQuery);
	}
}(this, function (Backbone,_i,$) {
	var CollectionView = Backbone.View.extend({
		initialize: function(options) {
			this.renderRound = 0;

			this.options = options;
			this.$tmpl = this.$el.clone();
			this.$el.hide();

			this.children = {};

			this.listenTo(this.collection,'add sort', this.render);

			this.listenTo(this.collection,'reset', function() {
				_.each(this.children,function(view,cid) {
					if (!this.collection.get(cid)) {
						view.remove();
						delete this.children[cid];
					}
				},this);

				this.render();
			});

			this.listenTo(this.collection,'remove', function(model) {
				if (!this.children[model.cid]) return; // Hopefully because we have't rendered yet.

				this.children[model.cid].remove();
				delete this.children[model.cid];
			});

			this.render();
		},
		render: function() {
			this.renderRound++;

			_(this.children).each(function(child) {
				child.$el.detach();
			});

			var models = this.collection.models.slice();

			var nextBundle = function(view,renderRound) {
				if (models.length === 0) return;
				if (renderRound != view.renderRound) return;

				var startTime = +new Date();
				var frag = document.createDocumentFragment();

				while(+new Date()-startTime <= 50) {
					var model = models.shift();

					if (!model) break;

					if (!view.children[model.cid]) {
						var child = view.$tmpl.clone()[0];
						view.children[model.cid] = new view.options.view({model:model,el:child}).render();
					}

					frag.appendChild(view.children[model.cid].el);
				}

				var siblings = view.$el.siblings().filter(function(i,el) {
					return _.chain(view.children).values().pluck('el').include(el).value();
				});

				if (siblings.length > 0) {
					$(_(siblings).last()).after(frag);
				}
				else {
					view.$el.after(frag);
				}

				setTimeout(function() {
					nextBundle(view,renderRound);
				},25);
			};

			nextBundle(this,this.renderRound);

			return this;
		},
		remove: function() {
			_.invoke(this.children,'remove');
			Backbone.View.prototype.remove.call(this);
		}
	});

	return CollectionView;
}));
