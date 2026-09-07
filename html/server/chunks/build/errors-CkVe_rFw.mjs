//#region app/utils/errors.ts
var ApiErrorCode = /* @__PURE__ */ function(ApiErrorCode) {
	ApiErrorCode[ApiErrorCode["SUCCESS"] = 0] = "SUCCESS";
	ApiErrorCode[ApiErrorCode["INVALID_API_CALL"] = 101] = "INVALID_API_CALL";
	ApiErrorCode[ApiErrorCode["MISSING_PARAMETER"] = 102] = "MISSING_PARAMETER";
	ApiErrorCode[ApiErrorCode["NO_PRIVILEGES"] = 103] = "NO_PRIVILEGES";
	ApiErrorCode[ApiErrorCode["INVALID_PARAMETER"] = 105] = "INVALID_PARAMETER";
	ApiErrorCode[ApiErrorCode["NO_TOKEN"] = 113] = "NO_TOKEN";
	ApiErrorCode[ApiErrorCode["INVALID_TOKEN"] = 201] = "INVALID_TOKEN";
	ApiErrorCode[ApiErrorCode["PROJECT_ERROR_START"] = 500] = "PROJECT_ERROR_START";
	ApiErrorCode[ApiErrorCode["COMMUNITY_NOT_FOUND"] = 500] = "COMMUNITY_NOT_FOUND";
	ApiErrorCode[ApiErrorCode["COMMUNITY_NAME_EXISTS"] = 501] = "COMMUNITY_NAME_EXISTS";
	ApiErrorCode[ApiErrorCode["COMMUNITY_HAS_ACTIVE_OFFICERS"] = 502] = "COMMUNITY_HAS_ACTIVE_OFFICERS";
	ApiErrorCode[ApiErrorCode["COMMUNITY_HAS_ACTIVE_RESIDENTS"] = 503] = "COMMUNITY_HAS_ACTIVE_RESIDENTS";
	ApiErrorCode[ApiErrorCode["COMMUNITY_HAS_ACTIVE_CALLS"] = 504] = "COMMUNITY_HAS_ACTIVE_CALLS";
	ApiErrorCode[ApiErrorCode["COMMUNITY_IS_NOT_ACTIVE"] = 505] = "COMMUNITY_IS_NOT_ACTIVE";
	ApiErrorCode[ApiErrorCode["FEATURED_OFFICER_NOT_FOUND"] = 506] = "FEATURED_OFFICER_NOT_FOUND";
	return ApiErrorCode;
}({});
var ERROR_MESSAGES = {
	[ApiErrorCode.SUCCESS]: "Success",
	[ApiErrorCode.INVALID_API_CALL]: "Invalid API call or endpoint not available",
	[ApiErrorCode.MISSING_PARAMETER]: "Required parameter is missing",
	[ApiErrorCode.NO_PRIVILEGES]: "You do not have permission for this action",
	[ApiErrorCode.INVALID_PARAMETER]: "Invalid parameter value",
	[ApiErrorCode.NO_TOKEN]: "Authentication required or token expired",
	[ApiErrorCode.INVALID_TOKEN]: "Invalid authentication token",
	[ApiErrorCode.COMMUNITY_NOT_FOUND]: "Community not found.",
	[ApiErrorCode.COMMUNITY_NAME_EXISTS]: "A community with this name already exists.",
	[ApiErrorCode.COMMUNITY_HAS_ACTIVE_OFFICERS]: "This community cannot be deleted because it has active officers assigned. Please reassign or remove all officers first, or consider deactivating the community instead.",
	[ApiErrorCode.COMMUNITY_HAS_ACTIVE_RESIDENTS]: "This community cannot be deleted because it has active residents assigned. Please reassign or remove all residents first, or consider deactivating the community instead.",
	[ApiErrorCode.COMMUNITY_HAS_ACTIVE_CALLS]: "This community cannot be deleted because it has open calls. Please resolve or close all calls first, or consider deactivating the community instead.",
	[ApiErrorCode.COMMUNITY_IS_NOT_ACTIVE]: "This community is currently deactivated.",
	[ApiErrorCode.FEATURED_OFFICER_NOT_FOUND]: "No featured officer banner exists for this community."
};
var ErrorType = /* @__PURE__ */ function(ErrorType) {
	ErrorType["NETWORK"] = "network";
	ErrorType["AUTHENTICATION"] = "authentication";
	ErrorType["AUTHORIZATION"] = "authorization";
	ErrorType["VALIDATION"] = "validation";
	ErrorType["SERVER"] = "server";
	ErrorType["UNKNOWN"] = "unknown";
	return ErrorType;
}({});
function getErrorType(rc) {
	if (rc === ApiErrorCode.NO_TOKEN || rc === ApiErrorCode.INVALID_TOKEN) return ErrorType.AUTHENTICATION;
	if (rc === ApiErrorCode.NO_PRIVILEGES) return ErrorType.AUTHORIZATION;
	if (rc === ApiErrorCode.MISSING_PARAMETER || rc === ApiErrorCode.INVALID_PARAMETER) return ErrorType.VALIDATION;
	if (rc >= ApiErrorCode.PROJECT_ERROR_START) return ErrorType.SERVER;
	if (rc === ApiErrorCode.INVALID_API_CALL) return ErrorType.SERVER;
	return ErrorType.UNKNOWN;
}
function getErrorMessage(rc, message) {
	if (message && !message.includes("success") && rc !== 0) return message;
	return ERROR_MESSAGES[rc] || "An unknown error occurred";
}

export { getErrorMessage, getErrorType };
//# sourceMappingURL=errors-CkVe_rFw.mjs.map
