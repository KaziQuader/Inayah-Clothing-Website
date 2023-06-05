import "./App.css";
import Header from "./component/layout/Header/Header.js";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WebFont from "webfontloader";
import React, { Suspense, useEffect, useState } from "react";
import Footer from "./component/layout/Footer/Footer.js";
import Home from "./component/Home/Home.js";
import ProductDetails from "./component/Product/ProductDetails.js";
import Products from "./component/Product/Products.js";
import Search from "./component/Product/Search.js";
import Login from "./component/User/Login.js";
import store from "./store";
import { loadUser } from "./actions/userAction";
import { useSelector } from "react-redux";
import UserOption from "./component/layout/Header/UserOption.js";
import Profile from "./component/User/Profile.js";
import ProtectedRoute from "./component/Route/ProtectedRoute";
import UpdateProfile from "./component/User/UpdateProfile.js";
import UpdatePassword from "./component/User/UpdatePassword.js";
import ForgotPassword from "./component/User/ForgotPassword.js";
import ResetPassword from "./component/User/ResetPassword.js";
import Cart from "./component/Cart/Cart.js";
import Shipping from "./component/Cart/Shipping.js";
import ConfirmOrder from "./component/Cart/ConfirmOrder.js";
import axios from "axios";
import Payment from "./component/Cart/Payment.js";
import ElementsLayout from "./component/Route/ElementsLayout.js";
import { loadStripe } from "@stripe/stripe-js";
import OrderSuccess from "./component/Cart/OrderSuccess.js";
import MyOrders from "./component/Order/MyOrder.js";
import OrderDetails from "./component/Order/OrderDetails.js";

function App() {
  const { user } = useSelector((state) => state.user);
  const [stripeApiKey, setstripeApiKey] = useState("");

  async function getStripeApiKey() {
    const { data } = await axios.get("/api/v1/stripeapikey");
    setstripeApiKey(data.stripeApiKey);
    console.log(data);
  }

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"],
      },
    });

    store.dispatch(loadUser());
    getStripeApiKey();
  }, []);

  return (
    <Suspense>
      <Router>
        <Header />
        {user && Object.keys(user).length > 0 && <UserOption user={user} />}

        <Routes>
          {/*  the route is set up for the root URL ("/") and specifies that when the user visits that URL, the Home component should be rendered. */}
          <Route exact path="/" Component={Home} />
          <Route exact path="/product/:id" Component={ProductDetails} />
          <Route exact path="/products" Component={Products} />
          <Route path="/products/:keyword" Component={Products} />
          <Route path="/products/product/:id" Component={ProductDetails} />
          <Route exact path="/search" Component={Search} />

          <Route exact path="/login" Component={Login} />

          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/me/update" element={<UpdateProfile />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/password/update" element={<UpdatePassword />} />
          </Route>

          <Route exact path="/password/forgot" Component={ForgotPassword} />
          <Route
            exact
            path="/password/reset/:token"
            Component={ResetPassword}
          />

          <Route exact path="/cart" Component={Cart} />
          <Route element={<ProtectedRoute />}>
            <Route path="/Shipping" element={<Shipping />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/order/confirm" element={<ConfirmOrder />} />
          </Route>

          {stripeApiKey && (
            <Route
              element={<ElementsLayout stripe={loadStripe(stripeApiKey)} />}
            >
              <Route path="/process/payment" element={<Payment />} />
            </Route>
          )}
          <Route element={<ProtectedRoute />}>
            <Route path="/success" element={<OrderSuccess />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<MyOrders />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Route>
        </Routes>
        <Footer />
      </Router>
    </Suspense>
  );
}

export default App;
