<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminMediaUploadController extends Controller
{
    public function postUploadProductImage(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'file' => [
                    'required',
                    'file',
                    'mimetypes:image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml,image/bmp',
                    'max:10240',
                ],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $disk = 'public';
            $path = $request->file('file')->store('products/images', $disk);
            $publicUrl = '/storage/'.$path;

            return $this->sendJsonResponse(true, 'Image uploaded.', [
                'path' => $path,
                'disk' => $disk,
                'url' => $publicUrl,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postUploadProductVideo(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'file' => [
                    'required',
                    'file',
                    'mimetypes:video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo',
                    'max:102400',
                ],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $disk = 'public';
            $path = $request->file('file')->store('products/videos', $disk);
            $publicUrl = '/storage/'.$path;

            return $this->sendJsonResponse(true, 'Video uploaded.', [
                'url' => $publicUrl,
                'path' => $path,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
