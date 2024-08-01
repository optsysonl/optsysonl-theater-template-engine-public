<?php

namespace App\Enums;

use Enums\SimpleEnumInterface;
use Enums\SimpleEnumTrait;

class MovieFormatEnum implements SimpleEnumInterface
{
    use SimpleEnumTrait;
    
    const format_2d      = '2D';
    const format_3d      = '3D';
    const format_imax    = 'IMAX';
    const format_imax_3d = 'IMAX 3D';
    const format_35mm    = '35mm';
    const format_70mm    = '70mm';
    const format_hfr     = 'HFR';

    const format_virtual     = 'Virtual';

}