<?php

namespace App\Enums;

enum OnboardingStatus: string
{
    case School = 'school';
    case Working = 'working';
    case Other = 'other';
}
