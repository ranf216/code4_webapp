import { B as BaseApiClient } from '../virtual/entry.mjs';

//#region app/api/officer.ts
var OfficerApi = class extends BaseApiClient {
	/**
	* Admin: Get list of officers with optional filters, search, and sorting
	*/
	async getOfficers(params, options) {
		const request = {
			"#request": "Officer/get_officers",
			...params
		};
		return this.request(request, options);
	}
	/**
	* Admin: Get full details of a single officer including evaluations
	*/
	async getOfficer(userId) {
		const request = {
			"#request": "Officer/get_officer",
			user_id: userId
		};
		return this.request(request);
	}
	/**
	* Admin: Create a new officer
	*/
	async addOfficer(params) {
		const request = {
			"#request": "Officer/add_officer",
			...params
		};
		return this.request(request);
	}
	/**
	* Admin: Update an existing officer (partial update)
	*/
	async updateOfficer(params) {
		const request = {
			"#request": "Officer/update_officer",
			...params
		};
		return this.request(request);
	}
	/**
	* Admin: Soft-delete an officer (only allowed if never logged in)
	*/
	async deleteOfficer(userId) {
		const request = {
			"#request": "Officer/delete_officer",
			user_id: userId
		};
		return this.request(request);
	}
	/**
	* Admin: Get all evaluations for a specific officer
	*/
	async getOfficerEvaluations(userId) {
		const request = {
			"#request": "Officer/get_officer_evaluations",
			user_id: userId
		};
		return this.request(request);
	}
	/**
	* Admin: Add a performance evaluation for an officer
	*/
	async addOfficerEvaluation(params) {
		const request = {
			"#request": "Officer/add_officer_evaluation",
			...params
		};
		return this.request(request);
	}
	/**
	* Admin: Soft-delete an officer evaluation
	*/
	async deleteOfficerEvaluation(evaluationId) {
		const request = {
			"#request": "Officer/delete_officer_evaluation",
			evaluation_id: evaluationId
		};
		return this.request(request);
	}
	/**
	* Officer (mobile): Get current officer's own profile details
	*/
	async getMyDetails() {
		return this.request({ "#request": "Officer/get_my_details" });
	}
	/**
	* Officer (mobile): Update current officer's own editable profile fields
	*/
	async updateMyDetails(params) {
		const request = {
			"#request": "Officer/update_my_details",
			...params
		};
		return this.request(request);
	}
	/**
	* Resident (mobile): Get public officer information for the resident's community
	*/
	async getOfficersInfo() {
		return this.request({ "#request": "Officer/get_officers_info" });
	}
};
var officerApi = new OfficerApi();

export { officerApi as o };
//# sourceMappingURL=officer-CPsAbV7J.mjs.map
