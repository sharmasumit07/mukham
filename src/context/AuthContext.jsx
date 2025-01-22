import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import Notify from "simple-notify";
import { useRouter } from 'next/router'
import toast from "react-hot-toast";

const AuthContext = createContext();
export const Axios = axios.create({ baseURL: 'http://localhost/mukham' });
// export const Axios = axios.create({ baseURL: 'https://velvizhiconstruction.site/api/siteLogsAPIs' });
// export const Axios = axios.create({ baseURL: 'https://client.velvizhiconstruction.site/api/siteLogsAPIs' });
// export const Axios = axios.create({ baseURL: 'https://api.flickanalytics.in/siteLogsAPIs' });


export const AxiosPost = async (apiname, body) => {
    const { data } = await Axios.post(apiname, body, {
        cache: false,
    })
    return data;
}

export const AxiosGet = async (apiname) => {
    const { data } = await Axios.get(apiname);
    console.log(data)
    return data;
}

export function pushNotify(status, title, text) {
    new Notify({
        status: status,
        title: title,
        text: text,
        effect: "slide",
        speed: 300,
        customClass: null,
        customIcon: null,
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 5000,
        gap: 20,
        distance: 20,
        type: 1,
        position: "right top",
    });
}

const AuthProvider = ({ children }) => {
    const [theUser, setUser] = useState(null);
    const [selectedSite, setSelectedSite] = useState('');
    const [movieSelected, setMovieSelected] = useState(false);
    const [wait, setWait] = useState(false);
    const router = useRouter()
    const loginUser = async ({ email, password }, errorCallback) => {
        console.log(email + " " + password)
        setWait(true);
        try {
            pushNotify("error", "error", "error")
            const { data } = await Axios.post('login.php', { username: email, password: password });
            console.log(data);
            const tempjson = { id: 1, role: "admin", fullName: "John Doe", username: "johndoe", email: "admin@materialize.com" }
            if (data.success && data.token) {
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('username', data.user_name);
                localStorage.setItem('userData', JSON.stringify(data.userData));
                localStorage.setItem('privilege', data.privilege)
                loggedInCheck();
                setWait(false);
                router.push("/")
                return { Success: true };
            } else {
                toast.error(data.message)
            }
            setWait(false);
        } catch (err) {
            setWait(false);
            return { success: false, message: 'Server Error!' };
        }
    }

    const loggedInCheck = async () => {
        const accessToken = localStorage.getItem('accessToken');
        Axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        if (accessToken) {
            const { data } = await Axios.get('getUser.php');
            if (data.success && data.userData) {
                setUser({ ...data.userData, ...JSON.parse(window.localStorage.getItem("userData")) });
                return;
            } else {
                localStorage.clear()
                setUser(null)
                router.push("/")
            }
        }
    }
    useEffect(() => {
        async function asyncCall() {
            await loggedInCheck();
        }
        asyncCall();
    }, []);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        router.push("/")
    }

    const movieSelectedCheck = () => {
        if (window.localStorage.getItem("movie") == null) setMovieSelected(false);
        else setMovieSelected(true);
    }

    return (
        <AuthContext.Provider value={{ login: loginUser, loading: wait, user: theUser, selectedSite: selectedSite, setSelectedSite: setSelectedSite, loggedInCheck, logout, movieSelectedCheck, movieSelected, setUser, setLoading: setWait }}>
            {children}
        </AuthContext.Provider>
    );
}
export { AuthContext, AuthProvider }
