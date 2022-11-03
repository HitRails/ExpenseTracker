import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import request from "../../request";
import Button from "../shared/Button/Button";
import styles from "./AccountsPage.module.css";
import LoadingIndicator from "../shared/LoadingIndicator";
import ErrorMessage from "../shared/ErrorMessage";

function AccountsRow({ account }) {
  return (
    <li className={styles.item}>
      <Link to={`/account/${account.id}`} className={styles.itemInner}>
        <div className={styles.nameText}>{account.name} ({account.number})</div>
        <div className={styles.balanceText}>${account.balance}</div>
      </Link>
    </li>
  );
}

function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(function () {
    async function loadAccounts() {
      try {
        const response = await request("/accounts", {
          method: "GET",
        });
        if (response.ok) {
          setAccounts(response.body);
          setStatus("loaded");
        } else {
          setStatus("error");
        }
      } catch(error) {
        setStatus("error");
      }
    }

    loadAccounts();
  }, []);

  let content;
  if (status === "loading") {
    content = <LoadingIndicator />;
  } else if (status === "loaded") {
    content = <AccountsList accounts={accounts} />;
  } else if (status === "error") {
    // content = <AccountsList accounts={accounts} />;
    content = <ErrorMessage />;
  } else {
    throw new Error(`Unexpected status: ${status}`);
  }

  return content;
}

function AccountsList({ accounts }) {
  const newAccountButton = <Button to={"/account/new"}>New Account</Button>;

  if (accounts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateMessage}>
          You do not have any accounts.
        </div>
        <div>{newAccountButton}</div>
      </div>
    );
  }

  return (
    <>
      <ul className={styles.list}>
        {accounts.map((account) => (
          <AccountsRow key={account.id} account={account} />
        ))}
      </ul>

      <div className={styles.actions}>{newAccountButton}</div>
    </>
  );
}

export default AccountsPage;
