import type { ShippingAddressInput } from '@/api/orderClient';

export type ShippingAddressField = keyof ShippingAddressInput;

const requiredFields: ShippingAddressField[] = [
    'full_name',
    'phone',
    'line1',
    'city',
    'state',
    'postal_code',
];

const fieldLabels: Record<ShippingAddressField, string> = {
    full_name: 'Full name',
    phone: 'Phone',
    line1: 'Address line 1',
    line2: 'Address line 2',
    city: 'City',
    state: 'State',
    postal_code: 'PIN / postal code',
    country: 'Country',
};

function digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * Client-side shipping address validation (mirrors API rules).
 * Returns Laravel-style keys: shipping_address.field
 */
export function validateShippingAddress(
    address: ShippingAddressInput,
    allowedCities: string[] = [],
): Record<string, string> {
    const errors: Record<string, string> = {};
    const key = (field: ShippingAddressField) => `shipping_address.${field}`;

    for (const field of requiredFields) {
        const value = (address[field] ?? '').trim();
        if (! value) {
            errors[key(field)] = `${fieldLabels[field]} is required.`;
        }
    }

    const name = address.full_name.trim();
    if (name && name.length < 2) {
        errors[key('full_name')] = 'Full name must be at least 2 characters.';
    }

    const line1 = address.line1.trim();
    if (line1 && line1.length < 3) {
        errors[key('line1')] = 'Address line 1 must be at least 3 characters.';
    }

    const city = address.city.trim();
    if (! city) {
        errors[key('city')] = 'Please select a delivery city.';
    } else if (allowedCities.length > 0 && ! allowedCities.includes(city)) {
        errors[key('city')] = 'We only deliver to Vapi and Daman.';
    }

    const state = (address.state ?? '').trim();
    if (state && state.length < 2) {
        errors[key('state')] = 'State must be at least 2 characters.';
    }

    const phoneDigits = digitsOnly(address.phone);
    if (address.phone.trim() && phoneDigits.length < 10) {
        errors[key('phone')] = 'Enter a valid 10-digit mobile number.';
    } else if (phoneDigits.length >= 10) {
        const lastTen = phoneDigits.slice(-10);
        if (! /^[6-9]\d{9}$/.test(lastTen)) {
            errors[key('phone')] = 'Enter a valid Indian mobile number starting with 6–9.';
        }
    }

    const pin = (address.postal_code ?? '').trim();
    if (pin && ! /^\d{6}$/.test(pin)) {
        errors[key('postal_code')] = 'Enter a valid 6-digit PIN code.';
    }

    const country = (address.country ?? 'IN').trim().toUpperCase();
    if (country && country !== 'IN') {
        errors[key('country')] = 'Delivery is available in India only.';
    }

    return errors;
}

export function mapApiFieldErrors(data: unknown): Record<string, string> {
    if (! data || typeof data !== 'object' || Array.isArray(data)) {
        return {};
    }

    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
        if (Array.isArray(v) && v[0]) {
            map[k] = String(v[0]);
        } else if (typeof v === 'string') {
            map[k] = v;
        }
    }

    return map;
}
