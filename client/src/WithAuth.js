import React from "react";
import axios from "axios";
import Message from "./components/Message";

export default function WithAuth(...args) {
  const ComponentAdmin = args[0];
  const ComponentJournalist = args[2];
  const ComponentEditor = args[1];


  const msg = "Unauthorized: Bạn không được cấp phép vào trang này.";

  const token = localStorage.getItem("auth-token");
  const userId = sessionStorage.getItem("userId");
  const [role, setRole] = React.useState(token);
  React.useEffect(() => {
    async function fetchData() {
      if (token) {
        const getRole = await axios.get(`/login/${token}`);
        const userRole = await getRole.data.data.role;

        setRole(userRole);

        if (userRole) {
          const checkToken = async () => {
            const res = await axios.post("/login/checkToken", {
              token: token,
              role: userRole
            });

            setRole(res.data.role);
          };

          checkToken();
        }
      } else {
        setRole(null);
      }
    }

    fetchData();
  }, [setRole, role, token, userId]);

  return (
    <React.Fragment>
      {role ? (
        role === "admin" ? (
          <ComponentAdmin />
        ) : role === "journalist" ? (
          <ComponentJournalist />
        ) : role === "editor" ? (
          <ComponentEditor />
        ) : role === "customer" || role === "not login" || role === "" || role === null ? (
          <Message message={msg} />
        ) : null
      ) : <Message message={msg} />}
    </React.Fragment>
  );
}
