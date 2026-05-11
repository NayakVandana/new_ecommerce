<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BrandApiController extends Controller
{
    public function postBrandsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer'],
                'current_page' => ['nullable', 'integer'],
                'keyword' => ['nullable', 'string'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page') ? (int) $request->input('per_page') : 15;
            $currentPage = $request->input('current_page') ? (int) $request->input('current_page') : 1;

            $query = Brand::query()->orderBy('sort_order')->orderBy('name');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%');
                });
            }

            $brands = $query->paginate($perPage, ['*'], 'page', $currentPage);

            return $this->sendJsonResponse(true, 'Brands fetched successfully.', $brands, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBrandStore(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'logo_url' => ['nullable', 'string', 'max:2048'],
                'description' => ['nullable', 'string'],
                'is_active' => ['nullable', 'boolean'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $slug = $request->input('slug') ?: Str::slug($request->input('name'));
            $slug = $this->uniqueBrandSlug($slug);

            $brand = Brand::query()->create([
                'name' => $request->input('name'),
                'slug' => $slug,
                'logo_url' => $request->input('logo_url'),
                'description' => $request->input('description'),
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $request->input('sort_order', 0),
            ]);

            return $this->sendJsonResponse(true, 'Brand created.', $brand, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBrandUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:brands,id'],
                'name' => ['sometimes', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'logo_url' => ['nullable', 'string', 'max:2048'],
                'description' => ['nullable', 'string'],
                'is_active' => ['nullable', 'boolean'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Brand|null $brand */
            $brand = Brand::query()->find($request->input('id'));

            if (! $brand) {
                return $this->sendJsonResponse(false, 'Brand not found.', null, 200);
            }

            $payload = [];

            if ($request->filled('name')) {
                $payload['name'] = $request->input('name');
            }

            if ($request->has('slug')) {
                $slug = $request->input('slug') ?: Str::slug($request->input('name', $brand->name));
                $payload['slug'] = $this->uniqueBrandSlug($slug, $brand->id);
            } elseif ($request->filled('name')) {
                $payload['slug'] = $this->uniqueBrandSlug(Str::slug($request->input('name')), $brand->id);
            }

            foreach (['logo_url', 'description'] as $field) {
                if ($request->has($field)) {
                    $payload[$field] = $request->input($field);
                }
            }

            if ($request->has('is_active')) {
                $payload['is_active'] = $request->boolean('is_active');
            }

            if ($request->has('sort_order')) {
                $payload['sort_order'] = $request->input('sort_order');
            }

            $brand->update($payload);

            return $this->sendJsonResponse(true, 'Brand updated.', $brand->fresh(), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBrandDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:brands,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            Brand::query()->whereKey($request->input('id'))->delete();

            return $this->sendJsonResponse(true, 'Brand deleted.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function uniqueBrandSlug(string $baseSlug, ?int $exceptId = null): string
    {
        $slug = $baseSlug;
        $n = 2;

        while (
            Brand::query()
                ->where('slug', $slug)
                ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$n;
            $n++;
        }

        return $slug;
    }
}
