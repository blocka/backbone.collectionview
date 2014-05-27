(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['backbone','underscore'], factory);
	} else {
		// Browser globals
		root.CollectionView = factory(root.Backbone,root._);
	}
}(this, function (Backbone,_) {
	var CollectionView = Backbone.View.extend({
		initialize: function(options) {
			this.options = options;
			this.$tmpl = this.$el.clone();
			this.$el.hide();

			this.children = {};

			this.listenTo(this.collection,'add sort', this.render);

			this.listenTo(this.collection,'reset', function() {
				_.each(this.children,function(view,cid) {
					if (!this.collection.get(cid)) {
						view.remove();
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
			_(this.children).each(function(child) {
				child.$el.detach();
			});

			var frag = document.createDocumentFragment();

			this.collection.each(function(model) {
				if (!this.children[model.cid]) {
					var child = this.$tmpl.clone()[0];
					this.children[model.cid] = new this.options.view({model:model,el:child}).render();
				}

				frag.appendChild(this.children[model.cid].el);
			},this);

			this.$el.after(frag);

			return this;
		},
		remove: function() {
			_.invoke(this.children,'remove');
			Backbone.View.prototype.remove.call(this);
		}
	});

	return CollectionView;
}));
