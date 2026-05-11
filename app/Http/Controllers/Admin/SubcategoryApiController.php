<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subcategory;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SubcategoryApiController extends Controller
{
    public function postSubcategoryStore(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'category_id' => ['required', 'integer', 'exists:categories,id'],
                'name' => ['required', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'image_url' => ['nullable', 'string', 'max:2048'],
                'description' => ['nullable', 'string'],
                'is_active' => ['nullable', 'boolean'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $slug = $request->input('slug') ?: Str::slug($request->input('name'));
            $slug = $this->uniqueSubcategorySlug((int) $request->input('category_id'), $slug);

            $subcategory = Subcategory::query()->create([
                'category_id' => $request->input('category_id'),
                'name' => $request->input('name'),
                'slug' => $slug,
                'image_url' => $request->input('image_url'),
                'description' => $request->input('description'),
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $request->input('sort_order', 0),
            ]);

            return $this->sendJsonResponse(true, 'Subcategory created.', $subcategory->fresh(), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postSubcategoryUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:subcategories,id'],
                'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
                'name' => ['sometimes', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'image_url' => ['nullable', 'string', 'max:2048'],
                'description' => ['nullable', 'string'],
                'is_active' => ['nullable', 'boolean'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Subcategory|null $subcategory */
            $subcategory = Subcategory::query()->find($request->input('id'));

            if (! $subcategory) {
                return $this->sendJsonResponse(false, 'Subcategory not found.', null, 200);
            }

            $categoryId = $request->filled('category_id')
                ? (int) $request->input('category_id')
                : $subcategory->category_id;

            $payload = [];

            if ($request->filled('name')) {
                $payload['name'] = $request->input('name');
            }

            if ($request->has('slug')) {
                $slug = $request->input('slug') ?: Str::slug($request->input('name', $subcategory->name));
                $payload['slug'] = $this->uniqueSubcategorySlug($categoryId, $slug, $subcategory->id);
            } elseif ($request->filled('name')) {
                $payload['slug'] = $this->uniqueSubcategorySlug(
                    $categoryId,
                    Str::slug($request->input('name')),
                    $subcategory->id,
                );
            }

            if ($request->filled('category_id')) {
                $payload['category_id'] = $categoryId;
            }

            foreach (['image_url', 'description'] as $field) {
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

            $subcategory->update($payload);

            return $this->sendJsonResponse(true, 'Subcategory updated.', $subcategory->fresh(), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postSubcategoryDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:subcategories,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            Subcategory::query()->whereKey($request->input('id'))->delete();

            return $this->sendJsonResponse(true, 'Subcategory deleted.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function uniqueSubcategorySlug(int $categoryId, string $baseSlug, ?int $exceptId = null): string
    {
        $slug = $baseSlug;
        $n = 2;

        while (
            Subcategory::query()
                ->where('category_id', $categoryId)
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
