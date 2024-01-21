import React from "react";
export default function Confirm({ callBackCancel, callBackDelete }) {
    return (
        <div className="confirmscreen">
            <div className="container-confirm">
                <header className="header-confirm">
                    Confirm
                    <i className="mdi mdi-close mdi-close-position" onClick={() => { callBackCancel() }} ></i>
                </header>
                <div className="body-confirm">
                    Bạn có chắc chắn muốn xóa?
                </div>
                <div className="footer-confirm">
                    <button className="btn btn-danger btn-confirm"
                        onClick={() => {
                            callBackDelete();
                            callBackCancel();
                        }}>Có</button>
                    <button className="btn btn-danger" onClick={() => { callBackCancel() }}>Không</button>
                </div>
            </div>
        </div>
    )
}