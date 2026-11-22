import { API_BASE_URL } from '../config/env';
import { resolveR2ImageUrl } from './resolveR2ImageUrl';

export function getR2ImageUrl(value) {
    return resolveR2ImageUrl(value, API_BASE_URL);
}
