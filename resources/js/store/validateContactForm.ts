export type ContactFieldKey = 'name' | 'email' | 'phone' | 'subject' | 'message';

export type ContactFormInput = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
};

function phoneDigits(phone: string): string {
    return phone.replace(/\D+/g, '');
}

export function validateContactForm(input: ContactFormInput): Partial<Record<ContactFieldKey, string>> {
    const errors: Partial<Record<ContactFieldKey, string>> = {};
    const name = input.name.trim();
    const email = input.email.trim();
    const phone = input.phone.trim();
    const subject = input.subject.trim();
    const message = input.message.trim();

    if (!name) {
        errors.name = 'Please enter your name.';
    } else if (name.length > 255) {
        errors.name = 'Name cannot exceed 255 characters.';
    }

    if (!email) {
        errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address.';
    } else if (email.length > 255) {
        errors.email = 'Email cannot exceed 255 characters.';
    }

    if (!phone) {
        errors.phone = 'Phone number is required.';
    } else {
        const digits = phoneDigits(phone);

        if (digits.length < 10) {
            errors.phone = 'Enter a valid 10-digit mobile number.';
        } else if (digits.length > 12) {
            errors.phone = 'Phone number is too long.';
        } else if (!/^[6-9]\d{9}$/.test(digits.slice(-10))) {
            errors.phone = 'Enter a valid Indian mobile number starting with 6–9.';
        }
    }

    if (subject.length > 200) {
        errors.subject = 'Subject cannot exceed 200 characters.';
    }

    if (!message) {
        errors.message = 'Please enter your message.';
    } else if (message.length < 10) {
        errors.message = 'Your message must be at least 10 characters.';
    } else if (message.length > 5000) {
        errors.message = 'Your message cannot exceed 5000 characters.';
    }

    return errors;
}

export function mapApiFieldErrors(data: unknown): Partial<Record<ContactFieldKey, string>> {
    if (!data || typeof data !== 'object') {
        return {};
    }

    const out: Partial<Record<ContactFieldKey, string>> = {};
    const keys: ContactFieldKey[] = ['name', 'email', 'phone', 'subject', 'message'];

    for (const key of keys) {
        const val = (data as Record<string, unknown>)[key];

        if (Array.isArray(val) && typeof val[0] === 'string') {
            out[key] = val[0];
        } else if (typeof val === 'string') {
            out[key] = val;
        }
    }

    return out;
}
