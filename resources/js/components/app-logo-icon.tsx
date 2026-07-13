import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 159 312" xmlns="http://www.w3.org/2000/svg" fill="currentColor" fillRule="evenodd" aria-label="Rakryan Coding">
            <polygon points="3,0 43,0 43,12 64,12 64,0 94,0 94,12 116,12 116,0 155,0 138,44 22,44" />
            <path d="M0,62 H159 V163 H0 V124 H120 V101 H0 Z" />
            <rect x="0" y="182" width="159" height="38" />
            <polygon points="0,239 159,239 159,312 79,276 0,312" />
        </svg>
    );
}
