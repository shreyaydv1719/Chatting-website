
export const Input = ({ label, name, type,placeholder,className,inputClassname,isrequired,value , onChange = () =>{} }) => {
    return (
      <>
        <div className={`${className}`}>
          <label
          for={name}
          className="block mb-2 text-sm font-medium text-gray-800">
            {label}
          </label>
          <input id={name} type={type} className={`bg-gray-50 border border-gray-300 text-gray-900
          text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 ${inputClassname}`}
          placeholder={placeholder} required={isrequired} value={value} onChange={onChange}>
          </input>
        </div>
      </>
    );
  };
  