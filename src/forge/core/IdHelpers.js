/**
 * ID Helpers
 * Utilities for internal vs code ID management
 */

export const CODE_ID_REGEX = /^[a-z][a-z0-9_]*$/;

/**
 * Sanitizes a string into a valid code ID
 * e.g. "Força Física" -> "forca_fisica"
 */
export function sanitizeCodeId(value) {
    if (!value) return '';

    let v = value.toLowerCase();

    // Replace spaces and hyphens with underscores
    v = v.replace(/[\s-]+/g, '_');

    // Remove accents
    v = v.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remove invalid chars
    v = v.replace(/[^a-z0-9_]/g, '');

    // Ensure starts with letter
    if (!/^[a-z]/.test(v) && v.length > 0) {
        v = 'f_' + v;
    }

    return v;
}

/**
 * Normalizes a field definition to the new schema
 * Ensures it has both internalId (GUID) and codeId (human readable)
 */
export function normalizeField(rawField) {
    // If already normalized, return as is
    if (rawField.internalId && rawField.codeId) {
        return rawField;
    }

    const oldId = rawField.id;

    // Generate new internalId if missing (using crypto.randomUUID if available, else simple fallback)
    const internalId = rawField.internalId || crypto.randomUUID();

    // Sanitize old ID for codeId if missing
    const codeId = rawField.codeId || sanitizeCodeId(oldId) || `field_${Date.now()}`;

    return {
        ...rawField,
        internalId,
        codeId,
        // Ensure name exists
        name: rawField.name || oldId,
        // Keep original ID just in case, but prefer internalId
        id: internalId
    };
}

export const normalizeEntity = normalizeField;
