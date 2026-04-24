
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAdminAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();
        const [isAdmin, setIsAdmin] = useState(false);

        useEffect(() => {
            const user = JSON.parse(localStorage.getItem('vvf_user'));
            if (!user || user.status !== 'admin') {
                router.push('/login');
            } else {
                setIsAdmin(true);
            }
        }, []);

        if (!isAdmin) {
            return null; 
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAdminAuth;
