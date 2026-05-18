<?php

return [

    'name' => env('MAIL_FROM_NAME', env('APP_NAME', 'Selorise')),

    'mail' => [
        'enabled' => filter_var(env('ORDER_MAIL_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
        'admin_notify' => env('MAIL_ADMIN_NOTIFY', env('MAIL_SUPPORT_EMAIL')),
        'support' => env('MAIL_SUPPORT_EMAIL', env('MAIL_FROM_ADDRESS')),
    ],

];
