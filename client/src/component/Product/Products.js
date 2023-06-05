import React, { Fragment, useEffect, useState } from "react";
import { getProduct } from "../../actions/productAction";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../layout/Loader/Loader";
import "./Products.css";
import ProductCard from "../Home/ProductCard";
import { useParams } from "react-router-dom";
import Pagination from "react-js-pagination";
import Slider from "@mui/material/Slider";
import { Typography, Grid } from "@mui/material";

const categories = ["Abaya", "machine"];

const Products = () => {
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState([0, 300000]);
  const [category, setCategory] = useState("");
  const [ratings, setRating] = useState(0);

  const { products, loading, productsCount, resultPerPage, filteredlength } =
    useSelector((state) => state.products);

  const { keyword } = useParams();

  const setCurrentPageNo = (e) => {
    setCurrentPage(e);
  };

  const priceHandler = (event, newPrice) => {
    setPrice(newPrice);
  };

  useEffect(() => {
    dispatch(getProduct(keyword, currentPage, price, category, ratings));
  }, [dispatch, keyword, currentPage, price, category, ratings]);

  let count = filteredlength;

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <h2 className="productsHeading">Products</h2>
          <div className="products">
            {products &&
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>

          <div className="filterBox">
            <Typography>Price</Typography>
            <Slider
              value={price}
              onChange={priceHandler}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              min={0}
              max={300000}
            />
          </div>

          <Typography>Categories</Typography>
          <ul className="categoryBox">
            {categories.map((category) => (
              <li
                className="category-link"
                key={category}
                onClick={() => setCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>

          <fieldset>
            <Typography component="legend">Ratings Above</Typography>
            <Slider
              value={ratings}
              onChange={(e, newRating) => {
                setRating(newRating);
              }}
              valueLabelDisplay="auto"
              aria-labelledby="continous-slider"
              min={0}
              max={5}
            />
          </fieldset>

          {resultPerPage <= count && (
            <div className="paginationBox">
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={resultPerPage}
                totalItemsCount={productsCount}
                onChange={setCurrentPageNo}
                nextPageText="Next"
                prevPageText="Prev"
                firstPageText="1st"
                lastPageText="last"
                itemClass="page-item"
                linkClass="page-link"
                activeClass="pageItemActive"
                activeLinkClass="pageLinkActive"
              />
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Products;
