import { useEffect, useRef, useState } from 'react';
import { prepareGoogleLogin } from '../services/authService';

let googleScript;

function loadGoogle() {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    if (!googleScript) {
        googleScript = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            const fail = () => {
                window.clearTimeout(deadline);
                script.remove();
                reject(new Error('Google Identity Services no disponible.'));
            };
            const deadline = window.setTimeout(fail, 15000);
            script.onload = () => {
                window.clearTimeout(deadline);
                if (window.google?.accounts?.id) resolve(window.google.accounts.id);
                else fail();
            };
            script.onerror = fail;
            document.head.append(script);
        }).catch((error) => {
            googleScript = undefined;
            throw error;
        });
    }
    return googleScript;
}

export default function GoogleSignInButton({ onCredential, text = 'continue_with', disabled = false }) {
    const target = useRef(null);
    const callback = useRef(onCredential);
    const setup = useRef(null);
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState('');
    callback.current = onCredential;

    useEffect(() => {
        const node = target.current;
        let active = true;
        if (!setup.current || setup.current.attempt !== attempt) {
            setup.current = { attempt, result: Promise.all([loadGoogle(), prepareGoogleLogin()]) };
        }
        setup.current.result.then(([google, result]) => {
            if (!active) return;
            if (!result.success || !result.data?.client_id || !result.data?.nonce) {
                setError(result.message || 'No se pudo preparar el acceso con Google.');
                return;
            }

            google.initialize({
                client_id: result.data.client_id,
                nonce: result.data.nonce,
                ux_mode: 'popup',
                auto_select: false,
                callback: async ({ credential }) => {
                    if (!active || !credential) return;
                    const signedIn = await callback.current(credential);
                    if (active && !signedIn) setAttempt((value) => value + 1);
                },
            });
            google.renderButton(node, {
                type: 'standard', theme: 'outline', size: 'large', text,
                width: Math.max(200, Math.min(400, Math.floor(node.clientWidth))),
                locale: 'es',
            });
            setError('');
        }).catch(() => {
            if (active) setError('Google no está disponible en este navegador.');
        });
        return () => {
            active = false;
            node.replaceChildren();
        };
    }, [attempt, text]);

    return (
        <div className="auth-google">
            <div ref={target} inert={disabled ? '' : undefined} />
            {error && (
                <div role="status">
                    <p>{error}</p>
                    <button type="button" onClick={() => { setError(''); setAttempt((value) => value + 1); }}>
                        Reintentar Google
                    </button>
                </div>
            )}
        </div>
    );
}
