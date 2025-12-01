import { Link } from "react-router-dom";
const NotFound = () => {
    return (
        <>
            <div className="bg-gray-100 flex flex-col justify-center items-center h-screen">

                <img

                    src="/images/not-found.svg" alt=""
                    className="lg:w-6/12 w-full"


                />
                <h1 className="text-zinc-600">404 Page Not Found!</h1>
                <Link to="/">

                    <button className="bg-indigo-500 text-white px-12 py-3 rounded-lg mt-4 hover:bg-green-700">
                        <i className="ri-home-fill mr-2"></i>
                        Go Home
                    </button>
                    
                </Link>

            </div>
        </>
    )
}

export default NotFound; 