

export const Button = ({ name, type,className,isrequired }) => {
    return (
        <>
        <div>
            <button type={type} className={`text-white cursor-pointer bg-blue-600 mr-2 mb-2 hover:bg-blue-800 focus:ring-4 
            focus:outline-none focus:ring-blue-300 text-base rounded-lg font-semibold 
            px-5 py-2.5 text-center ${className}`}  disabled={isrequired}>{name}</button>
        </div>
        </>
    )
}