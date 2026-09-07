import { B as BaseApiClient } from '../virtual/entry.mjs';

//#region app/api/community.ts
var CommunityApi = class extends BaseApiClient {
	/**
	* Get all communities. Admin only.
	* Pass include_inactive: true to include deactivated communities.
	* Pass search_text for server-side search (debounce on caller side).
	*/
	async getCommunities(params = {}, options) {
		return this.request({
			"#request": "Community/get_communities",
			...params
		}, options);
	}
	/**
	* Get a single community by ID.
	*/
	async getCommunity(communityId) {
		return this.request({
			"#request": "Community/get_community",
			community_id: communityId
		});
	}
	/**
	* Create a new community. Admin only.
	* map_image should be a base64 string (use fileToBase64 helper from useFileApi).
	*/
	async addCommunity(params) {
		return this.request({
			"#request": "Community/add_community",
			...params
		});
	}
	/**
	* Update an existing community. Admin only.
	* Only provided fields are modified. Officers/residents arrays are full-replacement when provided.
	* Pass empty array [] to clear all assignments.
	* Omit the field entirely to leave assignments unchanged.
	*/
	async updateCommunity(params) {
		return this.request({
			"#request": "Community/update_community",
			...params
		});
	}
	/**
	* Soft-delete a community. Admin only.
	* Fails with rc 502/503/504 if community has active officers/residents/calls.
	*/
	async deleteCommunity(communityId) {
		return this.request({
			"#request": "Community/delete_community",
			community_id: communityId
		});
	}
	/**
	* Get the featured officer banner for a community.
	* Returns rc 506 if no banner exists.
	*/
	async getFeaturedOfficer(communityId) {
		return this.request({
			"#request": "Community/get_featured_officer",
			community_id: communityId
		});
	}
	/**
	* Create or update the featured officer banner. Admin only.
	* Both image (base64) and description are mandatory.
	*/
	async setFeaturedOfficer(communityId, image, description) {
		return this.request({
			"#request": "Community/set_featured_officer",
			community_id: communityId,
			image,
			description
		});
	}
	/**
	* Delete the featured officer banner for a community. Admin only.
	* Returns rc 506 if no banner exists.
	*/
	async deleteFeaturedOfficer(communityId) {
		return this.request({
			"#request": "Community/delete_featured_officer",
			community_id: communityId
		});
	}
};
var communityApi = new CommunityApi();

export { communityApi as c };
//# sourceMappingURL=community-jevurWQo.mjs.map
