<?php

return [

  /*
  |--------------------------------------------------------------------------
  | Payment methods (storefront)
  |--------------------------------------------------------------------------
  |
  | Only methods listed here can be used at checkout. Currently COD only.
  |
  */
    'payment_methods' => [
        'cod' => 'Cash on delivery',
    ],

    'default_payment_method' => 'cod',

    'shipping_flat' => (float) env('CHECKOUT_SHIPPING_FLAT', 0),

    'tax_rate' => (float) env('CHECKOUT_TAX_RATE', 0),

    'initial_order_status' => 'pending',

    'cod_payment_status' => 'pending',

    /*
    |--------------------------------------------------------------------------
    | Delivery cities (storefront checkout)
    |--------------------------------------------------------------------------
    */
    'delivery_cities' => [
        'Vapi' => ['state' => 'Gujarat'],
        'Daman' => ['state' => 'Daman and Diu'],
    ],

];
