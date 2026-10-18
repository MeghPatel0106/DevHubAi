import Certificate from '../models/Certificate.js';

/**
 * @desc    Get all certificates for authenticated user
 * @route   GET /api/certificates
 * @access  Private
 */
export const getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).sort({
      issueDate: -1,
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new certificate
 * @route   POST /api/certificates
 * @access  Private
 */
export const createCertificate = async (req, res, next) => {
  try {
    const {
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      certificateImage,
      isPublic,
    } = req.body;

    if (!title || !issuer || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, issuing organization, and issue date are required',
      });
    }

    if (expiryDate && new Date(expiryDate) < new Date(issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be earlier than issue date',
      });
    }

    const certificate = await Certificate.create({
      user: req.user._id,
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialId: credentialId ? credentialId.trim() : '',
      credentialUrl: credentialUrl ? credentialUrl.trim() : '',
      certificateImage: certificateImage ? certificateImage.trim() : '',
      isPublic: isPublic !== false,
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate added successfully',
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single certificate by ID with ownership verification
 * @route   GET /api/certificates/:id
 * @access  Private
 */
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    if (certificate.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this certificate',
      });
    }

    return res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update certificate with ownership verification
 * @route   PUT /api/certificates/:id
 * @access  Private
 */
export const updateCertificate = async (req, res, next) => {
  try {
    let certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    if (certificate.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this certificate',
      });
    }

    const { issueDate, expiryDate } = req.body;
    const effectiveIssueDate = issueDate ? new Date(issueDate) : certificate.issueDate;
    const effectiveExpiryDate = expiryDate ? new Date(expiryDate) : certificate.expiryDate;

    if (effectiveExpiryDate && effectiveIssueDate && effectiveExpiryDate < effectiveIssueDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be earlier than issue date',
      });
    }

    const updateData = { ...req.body };
    delete updateData.user;

    certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete certificate with ownership verification
 * @route   DELETE /api/certificates/:id
 * @access  Private
 */
export const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    if (certificate.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this certificate',
      });
    }

    await certificate.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCertificates,
  createCertificate,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
};
