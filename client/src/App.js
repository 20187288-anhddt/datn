import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Navbar from "./components/commons/Navbar";
import Footer from "./components/commons/Footer";

// auth
import WithAuth from "./WithAuth";

// ScrollToTop
import ScrollToTop from "./ScrollToTop";
import ScrollToTopButton from './components/ScrollToTopButton';
import "./App.css";
import ResetPassword from "./components/pages/account/resetPassword";

// component lazy load
const Home = React.lazy(() => import("./components/pages/home/Index"));
const Login = React.lazy(() => import("./components/pages/account/Login"));
const Profile = React.lazy(() => import("./components/pages/account/Profile"));
const Register = React.lazy(() =>
	import("./components/pages/account/Register")
);
const ForgotPassword = React.lazy(() =>
	import("./components/pages/account/ForgotPassword")
);
const Contact = React.lazy(() => import("./components/pages/Contact"));
const NotFound = React.lazy(() => import("./components/pages/404NotFound"));

// admin
const Admin = React.lazy(() => import("./components/pages/admin"));
const Journalist = React.lazy(() => import("./components/pages/journalist"));
const Editor = React.lazy(() => import("./components/pages/editor"));

// news page
const Category = React.lazy(() => import("./components/pages/category"));
const Channel = React.lazy(() => import("./components/pages/channel"));
const Detail = React.lazy(() => import("./components/pages/detail"));

function App() {
	return (
		<Router className="App">
			<ScrollToTop />
			<div className="container-fluid mt-6 mb-3 min-h-100vh">
				<Navbar />
				<React.Suspense
					fallback={
						<div className="main-loader">
							<div className="loader"></div>
						</div>
					}
				>
					<Switch>
						<Route path="/" component={Home} exact />
						<Route path="/contact" component={Contact} />
						<Route
							path="/admin"
							component={() => WithAuth(Admin, Editor,Journalist)}
						/>
						<Route path="/login" component={Login} />
						<Route path="/register" component={Register} />
						<Route path="/forgot-password" component={ForgotPassword} />
						<Route path="/reset-password/:token" exact component={ResetPassword} />
						<Route path="/profile" component={Profile} />
						<Route path="/category/*/:id" component={Category} />
						<Route path="/channel/*/:id" component={Channel} />
						<Route path="/*/:id" component={Detail} />
						<Route path="/*" component={NotFound} />
					</Switch>
				</React.Suspense>
				<div></div>
				  <ScrollToTopButton />
			</div>
			<Footer />
		</Router>
	);
}

export default App;
