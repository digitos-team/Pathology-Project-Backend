import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import testService from "../services/labtest.services.js";
import labSchema from "../models/pathologyLab.model.js";


// Helper to get Lab ID from User ID
const getLabIdFromUser = async (userId) => {
    const lab = await labSchema.findOne({ owner: userId });
    if (!lab) {
        throw new ApiError(404, "No Lab found associated with this user. Please create a Lab first.");
    }
    return lab._id;
};

/**
 * @desc    Create new Test (Admin only)
 * @route   POST /api/tests
 */
export const createTest = asyncHandler(async (req, res) => {
    const labId = await getLabIdFromUser(req.user.userId || req.user._id);

    const test = await testService.createTest({
        ...req.body,
        labId: labId
    });

    res.status(201).json(
        new ApiResponse(201, test, "Test created successfully")
    );
});

/**
 * Get all active tests
 * GET /api/tests
 */
export const getAllTests = asyncHandler(async (req, res) => {
    const labId = await getLabIdFromUser(req.user.userId || req.user._id);
    const tests = await testService.getAllTests(labId);

    res.status(200).json(
        new ApiResponse(200, tests, "Tests fetched successfully")
    );
});

/**
 *     Get test by ID
 *    GET /api/tests/:id
 */
export const getTestById = asyncHandler(async (req, res) => {
    const labId = await getLabIdFromUser(req.user.userId || req.user._id);
    const test = await testService.getTestById(
        req.params.id,
        labId
    );

    if (!test) {
        throw new ApiError(404, "Test not found");
    }

    res.status(200).json(
        new ApiResponse(200, test, "Test fetched successfully")
    );
});

/**
 *     Update test
 *    PUT /api/tests/:id
 */
export const updateTest = asyncHandler(async (req, res) => {
    const labId = await getLabIdFromUser(req.user.userId || req.user._id);
    const updatedTest = await testService.updateTest(
        req.params.id,
        req.body,
        labId
    );

    if (!updatedTest) {
        throw new ApiError(404, "Test not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedTest, "Test updated successfully")
    );
});

/**
 * delete test
 * DELETE /api/tests/:id
 */
export const deleteTest = asyncHandler(async (req, res) => {
    const labId = await getLabIdFromUser(req.user.userId || req.user._id);
    const deletedTest = await testService.deleteTest(
        req.params.id,
        labId
    );

    if (!deletedTest) {
        throw new ApiError(404, "Test not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Test deleted successfully")
    );
});