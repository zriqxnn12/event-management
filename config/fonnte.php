<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Fonnte API Configuration
    |--------------------------------------------------------------------------
    |
    | Fonnte is used to send WhatsApp notifications for ticket orders and payments.
    | Obtain your API Device Token from https://fonnte.com dashboard.
    |
    */

    'token' => env('FONNTE_TOKEN', ''),

    'url' => env('FONNTE_URL', 'https://api.fonnte.com/send'),

    'country_code' => env('FONNTE_COUNTRY_CODE', '62'),

];

