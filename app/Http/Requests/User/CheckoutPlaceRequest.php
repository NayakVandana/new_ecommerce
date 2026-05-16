<?php

namespace App\Http\Requests\User;

use App\Support\StoreDelivery;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CheckoutPlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_method' => ['required', 'string', 'in:cod'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
            'save_address' => ['nullable', 'boolean'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.full_name' => ['required', 'string', 'min:2', 'max:255'],
            'shipping_address.phone' => ['required', 'string', 'max:32'],
            'shipping_address.line1' => ['required', 'string', 'min:3', 'max:255'],
            'shipping_address.line2' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', Rule::in(StoreDelivery::cityNames())],
            'shipping_address.state' => ['required', 'string', 'min:2', 'max:120'],
            'shipping_address.postal_code' => ['required', 'string', 'regex:/^\d{6}$/'],
            'shipping_address.country' => ['required', 'string', 'size:2', 'in:IN'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'shipping_address.required' => 'Shipping address is required.',
            'shipping_address.full_name.required' => 'Full name is required.',
            'shipping_address.full_name.min' => 'Full name must be at least 2 characters.',
            'shipping_address.phone.required' => 'Phone number is required.',
            'shipping_address.line1.required' => 'Address line 1 is required.',
            'shipping_address.line1.min' => 'Address line 1 must be at least 3 characters.',
            'shipping_address.city.required' => 'Please select a delivery city.',
            'shipping_address.city.in' => 'We only deliver to Vapi and Daman.',
            'shipping_address.state.required' => 'State is required.',
            'shipping_address.state.min' => 'State must be at least 2 characters.',
            'shipping_address.postal_code.required' => 'PIN / postal code is required.',
            'shipping_address.postal_code.regex' => 'Enter a valid 6-digit PIN code.',
            'shipping_address.country.required' => 'Country is required.',
            'shipping_address.country.in' => 'Delivery is available in India only.',
            'payment_method.in' => 'Only cash on delivery is available.',
        ];
    }

    protected function failedValidation(ValidatorContract $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'data' => $validator->errors()->getMessages(),
        ], 200));
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $phone = (string) $this->input('shipping_address.phone', '');
            $digits = preg_replace('/\D+/', '', $phone) ?? '';

            if (strlen($digits) < 10) {
                $validator->errors()->add('shipping_address.phone', 'Enter a valid 10-digit mobile number.');
            }

            if (strlen($digits) > 12) {
                $validator->errors()->add('shipping_address.phone', 'Phone number is too long.');
            }

            if ($digits !== '' && ! preg_match('/^[6-9]\d{9}$/', substr($digits, -10))) {
                $validator->errors()->add('shipping_address.phone', 'Enter a valid Indian mobile number starting with 6–9.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function validatedShippingAddress(): array
    {
        /** @var array<string, mixed> $address */
        $address = $this->validated('shipping_address');

        $city = trim((string) $address['city']);
        $state = StoreDelivery::stateForCity($city) ?? trim((string) $address['state']);

        return [
            'full_name' => trim((string) $address['full_name']),
            'phone' => trim((string) $address['phone']),
            'line1' => trim((string) $address['line1']),
            'line2' => isset($address['line2']) ? trim((string) $address['line2']) : null,
            'city' => $city,
            'state' => $state,
            'postal_code' => trim((string) $address['postal_code']),
            'country' => strtoupper(trim((string) ($address['country'] ?? 'IN'))),
        ];
    }
}
