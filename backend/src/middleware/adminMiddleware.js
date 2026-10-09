const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required before verifying admin access.'
            }
        });
    }

    const role = req.user.role ? req.user.role.toUpperCase() : '';

    if (role !== 'ADMIN') {
        return res.status(403).json({
            error: {
                code: 'ADMIN_FORBIDDEN',
                message: 'Administrator access is required.'
            }
        });
    }

    next();
};

module.exports = adminMiddleware;
