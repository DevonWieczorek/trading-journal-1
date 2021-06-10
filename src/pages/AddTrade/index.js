import React, { useEffect, useState } from "react";
import "./style.scss";
import MainLayout from "../../layouts/main";
import { ReactComponent as ExportIcon } from "../../assets/export.svg";
import Input from "../../components/Input";
import InputTags from "../../components/InputTags";
import CalendarInput from "../../components/Calendar";
import Button from "../../components/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  addTradeStart,
  editTradeStart,
  updateBalanceStart,
} from "../../redux/Trades/trades.actions";
import Select from "../../components/Select";
import { useHistory, useParams } from "react-router-dom";

const mapState = ({ trades, posts }) => ({
  balance: trades.balance,
  balanceChanged: trades.balanceChanged,
  trades: trades.trades,
  loading: posts.isLoading,
});

const AddTrade = () => {
  const [value, onChange] = useState(new Date());
  const [tags, setTags] = useState({
    arr: [],
    error: false,
  });
  const [side, setSide] = useState("Buy");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState({
    value: "",
    error: false,
  });
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [expiry, setExpiry] = useState(new Date());
  const [net, setNet] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [notes, setNotes] = useState("");

  const { balance, trades, loading, balanceChanged } = useSelector(mapState);
  const dispatch = useDispatch();
  const { id } = useParams();
  const history = useHistory();

  const isOption = (type) => type === "Call" || type === "Put";

  const handleTagsChange = (newTags) =>
    setTags((prev) => ({ ...prev, arr: [...newTags].sort(), error: false }));

  const onTypeChange = (newType) =>
    setType((prev) => ({ ...prev, value: newType, error: false }));

  const validateNumber = (value) => {
    return isNaN(value) || value < 0 ? 0 : parseFloat(value);
  };

  const validatePrice = (value) => {
    return !isNaN(value) ? parseFloat(value) : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tags.arr.length === 0) {
      setTags((prev) => ({ ...prev, error: true }));
      return;
    }

    if (type.value === "") {
      setType((prev) => ({ ...prev, error: true }));
      return;
    }
    const trade = {
      date: value,
      tags: tags.arr,
      side,
      symbol,
      quantity: validateNumber(quantity),
      price: validatePrice(price),
      stopLoss: validateNumber(stopLoss),
      takeProfit: validateNumber(takeProfit),
      strikePrice: validateNumber(strikePrice),
      expiry,
      net: validatePrice(price),
      imgUrl,
      notes,
      type: type.value,
    };

    if (id) {
      dispatch(editTradeStart({ trade, id }));
      if (!loading) setTimeout(() => history.push("/mytrades"), 1000);
    } else dispatch(addTradeStart({ trade }));
    clearForm();
  };

  const clearForm = () => {
    setSide("Buy");
    setTakeProfit("");
    setSymbol("");
    setTags({
      arr: [],
      error: false,
    });
    setQuantity("");
    setPrice("");
    setImgUrl("");
    setStopLoss("");
    setStrikePrice("");
    setNotes("");
    setNet("");
  };

  useEffect(() => {
    if (balanceChanged) dispatch(updateBalanceStart(balance));
  }, [balanceChanged]);

  useEffect(() => {
    if (id) {
      const trade = trades.find((el) => el.id === id);
      onChange(trade.date);
      setSide(trade.side);
      setStopLoss(trade.stopLoss);
      setTakeProfit(trade.takeProfit);
      setStrikePrice(trade.strikePrice);
      setExpiry(trade.expiry);
      setSymbol(trade.symbol);
      setTags((prev) => ({ ...prev, arr: [...trade.tags] }));
      setQuantity(trade.quantity);
      setPrice(trade.price);
      setImgUrl(trade.imgUrl);
      setNotes(trade.notes);
      setNet(trade.net);
      setType((prev) => ({
        ...prev,
        value: trade.type,
      }));
    } else {
      clearForm();
    }
  }, [id]);

  return (
    <MainLayout title={id ? "Edit Trade" : "Add Trade"}>
      <section className="section">
        <h4 className="section_title">
          <ExportIcon className="icon-small" />
          <span>Manual Entry</span>
        </h4>
        <p>
          Use this form to {id ? "edit" : "insert"} your trades manually.
          Mandatory fields are marked with *.
        </p>
        <div className="col-12 mt-1">
          <form className="add_form" onSubmit={handleSubmit}>

            <div className="col-10">
              <label className="label">Trade Side *:</label>
              <div className="row">
                <div className="radio">
                  <input
                    type="radio"
                    name="trade_side"
                    className="radio"
                    id="radio_buy"
                    defaultChecked
                    onClick={() => setSide("Buy")}
                  />
                  <label className="radio_label" htmlFor="radio_buy">
                    Buy
                  </label>
                </div>
                <div className="radio">
                  <input
                    type="radio"
                    name="trade_side"
                    id="radio_sell"
                    className="radio"
                    onClick={() => setSide("Sell")}
                  />
                  <label className="radio_label" htmlFor="radio_sell">
                    Sell
                  </label>
                </div>
              </div>
            </div>

            <div className="col-10">
              <Input
                label="Symbol *:"
                placeholder="Eg. EURUSD"
                handler={(e) => setSymbol(e.target.value.toUpperCase())}
                required
                value={symbol}
              />
            </div>

            <div className="col-10">
              <label className="label">Type *:</label>
              <Select
                list={["Limit", "Market", "Stop", "StopLimit", "Call", "Put"]}
                selected={type.value}
                handler={onTypeChange}
              />
            </div>

            <div className="col-10">
              <label className="label">Date *:</label>
              <CalendarInput
                value={value}
                onChange={onChange}
                showDate={true}
              />
            </div>

            <div className="col-10">
              <Input
                label="Quanitity *:"
                type="number"
                handler={(e) => setQuantity(e.target.value)}
                required
                value={quantity}
              />
            </div>

            <div className="col-10">
              <Input
                label="Price *:"
                type="number"
                handler={(e) =>
                  setPrice(
                    side === "Sell" ? e.target.value : e.target.value * -1
                  )
                }
                required
                value={price}
              />
            </div>

            {isOption(type?.value) &&
                <>
                    <div className="col-10">
                      <Input
                        label="Strike Price:"
                        type="number"
                        handler={(e) => setStrikePrice(e.target.value)}
                        value={strikePrice}
                      />
                    </div>
                    <div className="col-10">
                      <label className="label">Expiry:</label>
                      <CalendarInput
                        value={expiry}
                        onChange={setExpiry}
                        showDate={true}
                      />
                    </div>
                </>
            }

            {side === "Buy" && (
              <>
                <div className="col-10">
                  <Input
                    label="Stop Loss:"
                    type="number"
                    handler={(e) => setStopLoss(e.target.value)}
                    value={stopLoss}
                  />
                </div>
                <div className="col-10">
                  <Input
                    label="Take Profit:"
                    type="number"
                    handler={(e) => setTakeProfit(e.target.value)}
                    value={takeProfit}
                  />
                </div>
              </>
            )}

            <div className="col-10">
              <Input
                label="Image Url:"
                handler={(e) => setImgUrl(e.target.value)}
                value={imgUrl}
              />
            </div>

            <div className="col-10">
              <label className="label">Notes:</label>
              <textarea
                cols="30"
                rows="5"
                className="input text_area"
                onChange={(e) => setNotes(e.target.value)}
                value={notes}
              />
            </div>

            <div className="col-10">
              <label className="label">Tags (add at least one) *:</label>
              <InputTags
                defaultTags={tags.arr}
                onChange={handleTagsChange}
                error={tags.error}
              />
            </div>

            {type.error ? (
              <p className="text-red mt-1">Please pick trade type!</p>
            ) : null}

            <div className="col-10 ">
              <Button type="submit" btnStyle="mt-2">
                Save
              </Button>
            </div>

          </form>
        </div>
      </section>
    </MainLayout>
  );
};

export default AddTrade;
