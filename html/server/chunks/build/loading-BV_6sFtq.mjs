import { defineStore } from 'pinia';

//#region app/stores/loading.ts
var useLoadingStore = defineStore("loading", {
	state: () => ({
		isLoading: false,
		message: "Loading...",
		requestCount: 0
	}),
	getters: { showLoading: (state) => state.isLoading && state.requestCount > 0 },
	actions: {
		/**
		* Show loading with optional message
		*/
		show(message) {
			this.message = message || "Loading...";
			this.requestCount++;
			this.isLoading = true;
		},
		/**
		* Hide loading
		*/
		hide() {
			this.requestCount = Math.max(0, this.requestCount - 1);
			if (this.requestCount === 0) {
				this.isLoading = false;
				this.message = "Loading...";
			}
		},
		/**
		* Force hide all loading states
		*/
		hideAll() {
			this.requestCount = 0;
			this.isLoading = false;
			this.message = "Loading...";
		},
		/**
		* Execute function with loading state
		*/
		async withLoading(fn, message) {
			try {
				this.show(message);
				return await fn();
			} finally {
				this.hide();
			}
		}
	}
});

export { useLoadingStore };
//# sourceMappingURL=loading-BV_6sFtq.mjs.map
