import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";

import LoadingIndicator from "../shared/LoadingIndicator";
import ErrorMessage from "../shared/ErrorMessage";
import request from "../../request";
import styles from "./ExpenseEdit.module.css";
import Button from "../shared/Button/Button";
import { useNotifications } from "../../hooks/Notifications/Notifications";

function ExpenseForm({ expense, onSave, disabled, onDelete }) {
  const [changes, setChanges] = useState({});
  const [accounts, setAccounts] = useState([]);
  const { notifyError } = useNotifications();

  useEffect(function () {
    async function loadAccounts() {
      try {
        const response = await request("/accounts", {
          method: "GET",
        });
        if (response.ok) {
          setAccounts(response.body);
          expense.id ?
          changeField('account_id', expense.account.id) :
          changeField('account_id', response.body[0].id);
        } else {
          notifyError("Failed to load Accounts");
        }
      } catch(error) {
        notifyError("Failed to load Accounts");
      }
    }

    loadAccounts();
  }, [expense.id]);

  function changeField(field, event) {
    event.preventDefault();
    const value = event.target.value;
    setChanges({
      ...changes,
      [field]: value,
    });
  }

  const formData = {
    ...expense,
    ...changes,
  };

  function handleSubmit(event) {
    event.preventDefault();
    onSave(changes);
  }

  return (
    <form autoComplete={"off"} onSubmit={handleSubmit} className={styles.form}>
      <fieldset disabled={disabled ? "disabled" : undefined}>
        <div className={styles.formRow}>
          <label htmlFor="amount">Amount</label>
          <input
            required
            min={"0"}
            id={"amount"}
            type={"number"}
            value={formData.amount}
            onChange={(event) => changeField("amount", event)}
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="account">Account</label>
            <select required
              value={formData.account_id}
              onChange={(event) => changeField("account_id", event)}>
              {
                accounts.map((account
                  ) => <option key={account.id} value={account.id}>{account.name}</option>
                )
              }
            </select>
        </div>

        <div className={styles.formRow}>
          <label htmlFor="date">Date</label>
          <input
            required
            id={"date"}
            type={"date"}
            value={formData.date}
            onChange={(event) => changeField("date", event)}
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="description">Description</label>
          <input
            required
            id={"description"}
            type={"text"}
            value={formData.description}
            onChange={(event) => changeField("description", event)}
          />
        </div>
      </fieldset>

      <div className={styles.formFooter}>
        <p>Do not have an account? {<Link to={"/account/new"}>Create one</Link>} </p>
        <div>
          {expense.id && (
            <Button action={onDelete} kind={"danger"} disabled={disabled}>
              Delete
            </Button>
          )}
          <Button
            type={"submit"}
            disabled={Object.keys(changes).length === 0 || disabled}
          >
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}

const defaultExpenseData = {
  amount: 0,
  date: new Date().toISOString().substr(0, 10),
  account_id: null,
  description: "",
};

function ExpenseEdit() {
  const { id } = useParams();
  const history = useHistory();
  const [expense, setExpense] = useState(id ? null : defaultExpenseData);
  const [loadingStatus, setLoadingStatus] = useState(id ? "loading" : "loaded");
  const [isSaving, setSaving] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const { notifyError, notifySuccess } = useNotifications();

  useEffect(
    function () {
      async function loadExpense() {
        try {
          const response = await request(`/expenses/${id}`, {
            method: "GET",
          });
          if (response.ok) {
            setExpense(response.body);
            setLoadingStatus("loaded");
          } else {
            setLoadingStatus("error");
          }
        } catch (error) {
          setLoadingStatus("error");
        }
      }

      if (id) {
        loadExpense();
      }
    },
    [id]
  );

  async function handleSave(changes) {
    try {
      setSaving(true);
      const url = expense.id ? `/expenses/${expense.id}` : "/expenses";
      const method = expense.id ? "PATCH" : "POST";
      const body = expense.id ? changes : { ...defaultExpenseData, ...changes };
      const response = await request(url, {
        method,
        body,
      });
      if (response.ok) {
        const message = expense.id ? 'Expense is updated successfully' : 'Expense is created successfully';
        notifySuccess(message);
        history.push('/expenses');
      } else {
        response.body.error ?
        notifyError(response.body.error) :
        notifyError("Failed to save expense. Please try again");
      }
    } catch (error) {
      notifyError(
        "Failed to save expense. Please check your internet connection"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await request(`/expenses/${expense.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        history.push("/expenses");
        notifySuccess('Expense Deleted Successfully');
      } else {
        notifyError("Failed to delete expense. Please try again");
      }
    } catch (error) {
      notifyError(
        "Failed to delete expense. Please check your internet connection"
      );
    } finally {
      setDeleting(false);
    }
  }

  let content;
  if (loadingStatus === "loading") {
    content = <LoadingIndicator />;
  } else if (loadingStatus === "loaded") {
    content = (
      <ExpenseForm
        key={expense.updated_at}
        expense={expense}
        onSave={handleSave}
        disabled={isSaving || isDeleting}
        onDelete={handleDelete}
      />
    );
  } else if (loadingStatus === "error") {
    content = <ErrorMessage />;
  } else {
    throw new Error(`Unexpected loadingStatus: ${loadingStatus}`);
  }

  return <div>{content}</div>;
}

export default ExpenseEdit;
