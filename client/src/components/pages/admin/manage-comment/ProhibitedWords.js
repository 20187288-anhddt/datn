import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setMessage } from "../../../../actions/message.action";
import Message from "../../Message";
import { closeMessage } from "../../closeMessage";

export default function Comment() {
	const [words, setWords] = React.useState([]);
	const [wordAlready, setWordAlready] = React.useState("");
	const { register, handleSubmit, errors } = useForm();
	const dispatch = useDispatch();

	React.useEffect(() => {
		dispatch(setMessage({ message: "" }));

		const fetchWords = async () => {
			const res = await axios.get("/comments/prohibitedWords");
			const data = res.data.data;

			setWords(data[0]?.words);
		};

		fetchWords();
	}, [dispatch]);

	const onSubmit = async data => {
		try {
			const text = data.word.trim();

			if (words) {
				if (words.includes(text)) {
					setWordAlready("Từ đã tồn tại");
				} else {
					const res = await axios.put('/comments/prohibitedWords', data);
					const { code, message } = res.data;

					dispatch(setMessage({ code, message }));
					dispatch(closeMessage());
					setWordAlready("");
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<div className="content-wrapper" >
				<div className="page-header">
					<h3 className="page-title">
						<span className="page-title-icon bg-gradient-danger text-white mr-2">
							<i className="mdi mdi-format-list-bulleted" />
						</span>
						Thêm từ vào danh sách đen
					</h3>
				</div>
				<div className="row" style={{ padding: "0px 30px" }}>
					<div className="col-xl-12 grid-margin">
						<div className="font-weight-bold mb-4">Thêm từ vào danh sách đen:</div>
						<form onSubmit={handleSubmit(onSubmit)} className="w-100">
							<Message />
							<div className="form-group">
								<input
									type="text"
									name="word"
									style={{ border: `${errors.word ? "1px solid red" : ""}` }}
									className="form-control"
									placeholder="Nhập từ cấm bình luận..."
									ref={register({ required: true })}
								/>
								{errors.word && (
									<small className="text-danger">Không được để trống</small>
								)}
								{wordAlready ? (
									<div className="mt-1">
										<small className="text-danger">{wordAlready}</small>
									</div>
								) : (
									""
								)}
							</div>
							<button type="submit" className="btn btn-danger bety-btn">
								Thêm
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}