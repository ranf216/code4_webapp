import { B as BaseApiClient } from '../virtual/entry.mjs';

//#region app/api/adminUser.ts
var AdminUserApi = class extends BaseApiClient {
	/**
	* Get a list of all management system users.
	* Admin only. Super Admin is typically required by business rules.
	*/
	async getAdminUsers(params = {}, options) {
		return this.request({
			"#request": "AdminUser/get_admin_users",
			...params
		}, options);
	}
	/**
	* Get a single management system user by ID.
	* Admin only.
	*/
	async getAdminUser(userId, options) {
		return this.request({
			"#request": "AdminUser/get_admin_user",
			user_id: userId
		}, options);
	}
	/**
	* Create a new management system user.
	* Admin only. The new user is created active and must change the initial password on first login.
	*/
	async addAdminUser(params, options) {
		return this.request({
			"#request": "AdminUser/add_admin_user",
			...params
		}, options);
	}
	/**
	* Update an existing management system user.
	* Only provided fields are modified. If email is changed, initial_password is mandatory.
	*/
	async updateAdminUser(params, options) {
		return this.request({
			"#request": "AdminUser/update_admin_user",
			...params
		}, options);
	}
	/**
	* Soft-delete a management system user.
	* Admin only. Cannot delete yourself or the last active admin (rc 771).
	*/
	async deleteAdminUser(userId, options) {
		return this.request({
			"#request": "AdminUser/delete_admin_user",
			user_id: userId
		}, options);
	}
	/**
	* Change a user's role. Super Admin only.
	* Cannot change your own role (rc 772).
	*/
	async changeAdminUserRole(params, options) {
		return this.request({
			"#request": "AdminUser/change_admin_user_role",
			...params
		}, options);
	}
	/**
	* Reset a user's password to a new initial password. Super Admin only.
	* The user is logged out and forced to change the password on next login.
	*/
	async resetAdminUserPassword(params, options) {
		return this.request({
			"#request": "AdminUser/reset_admin_user_password",
			...params
		}, options);
	}
	/**
	* Change the current user's own password voluntarily. Any admin role.
	*/
	async changeMyPassword(params, options) {
		return this.request({
			"#request": "AdminUser/change_my_password",
			...params
		}, options);
	}
};
var adminUserApi = new AdminUserApi();

export { adminUserApi as a };
//# sourceMappingURL=adminUser-BkDnDana.mjs.map
