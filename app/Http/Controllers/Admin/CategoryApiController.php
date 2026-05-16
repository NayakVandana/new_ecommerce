<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryApiController extends Controller
{
    public function postCategoriesList(Request $request)
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

            $query = Category::query()
                ->withCount('subcategories')
                ->with(['subcategories' => fn ($q) => $q->orderBy('sort_order')->orderBy('name')])
                ->orderBy('sort_order')
                ->orderBy('name');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%');
                });
            }

            $categories = $query->paginate($perPage, ['*'], 'page', $currentPage);

            return $this->sendJsonResponse(true, 'Categories fetched successfully.', $categories, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCategoryShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:categories,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $category = Category::query()
                ->with(['subcategories' => fn ($q) => $q->orderBy('sort_order')->orderBy('name')])
                ->find($request->input('id'));

            if (! $category) {
                return $this->sendJsonResponse(false, 'Category not found.', null, 200);
            }

            return $this->sendJsonResponse(true, 'Category fetched successfully.', $category, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCategoryStore(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
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
            $slug = $this->uniqueCategorySlug($slug);

            $category = Category::query()->create([
                'name' => $request->input('name'),
                'slug' => $slug,
                'image_url' => $request->input('image_url'),
                'description' => $request->input('description'),
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $request->input('sort_order', 0),
            ]);

            return $this->sendJsonResponse(true, 'Category created.', $category, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCategoryUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:categories,id'],
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

            /** @var Category|null $category */
            $category = Category::query()->find($request->input('id'));

            if (! $category) {
                return $this->sendJsonResponse(false, 'Category not found.', null, 200);
            }

            $payload = [];

            if ($request->filled('name')) {
                $payload['name'] = $request->input('name');
            }

            if ($request->has('slug')) {
                $slug = $request->input('slug') ?: Str::slug($request->input('name', $category->name));
                $payload['slug'] = $this->uniqueCategorySlug($slug, $category->id);
            } elseif ($request->filled('name')) {
                $payload['slug'] = $this->uniqueCategorySlug(Str::slug($request->input('name')), $category->id);
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

            $category->update($payload);

            return $this->sendJsonResponse(true, 'Category updated.', $category->fresh(), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCategoryDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:categories,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            Category::query()->whereKey($request->input('id'))->delete();

            return $this->sendJsonResponse(true, 'Category deleted.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function uniqueCategorySlug(string $baseSlug, ?int $exceptId = null): string
    {
        $slug = $baseSlug;
        $n = 2;

        while (
            Category::query()
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
