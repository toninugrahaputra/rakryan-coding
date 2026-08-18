<?php

namespace App\Actions\Fortify;

class GetPasswordRequirements
{
    /**
     * @return array{min: int, letters: bool, mixedCase: bool, numbers: bool, symbols: bool, uncompromised: bool}
     */
    public function handle(): array
    {
        // Di luar production sengaja dilonggarkan supaya pembuatan akun uji coba tidak
        // memperlambat pengembangan.
        if (! app()->isProduction()) {
            return [
                'min' => 8,
                'letters' => false,
                'mixedCase' => false,
                'numbers' => false,
                'symbols' => false,
                'uncompromised' => false,
            ];
        }

        return [
            'min' => 12,
            'letters' => true,
            'mixedCase' => true,
            'numbers' => true,
            'symbols' => true,
            'uncompromised' => true,
        ];
    }
}
