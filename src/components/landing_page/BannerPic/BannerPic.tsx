import React from "react";

const Contact = () => {
  return (
    <>
      <span id="contact"></span>
      <div className="dark:bg-black dark:text-white py-14">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-dark py-8 px-6 bg-teal-500">
            <div className="col-span-2 space-y-3">
              <h1 className="text-5xl font-bold text-white">
                Let's work together on your next project
              </h1>
              <p className="text-white">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Exercitationem necessitatibus quasi et vel,{" "}
              </p>
            </div>
            <div className="grid place-items-center">
              <a
                href="#"
                className="rounded inline-block font-semibold py-2 px-6 bg-yellow-600 text-white hover:bg-primary/80 duration-200 tracking-widest uppercase "
              >
                Let's try
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;