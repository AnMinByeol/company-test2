import React, { useState, useEffect } from "react";
import "./App.css";

// 지역 코드에 따른 텍스트 반환
function getRegionText(regionCd) {
  switch (regionCd) {
    case 1:
      return "도내";
    case 2:
      return "도외";
    case 3:
      return "기타";
    default:
      return "";
  }
}

// 정산 방법 코드에 따른 텍스트 반환
function getCalText(calCd) {
  switch (calCd) {
    case 1:
      return "고산농협";
    case 2:
      return "직접정산";
    case 3:
      return "기타";
    default:
      return "";
  }
}

// 사용 여부 코드에 따른 텍스트 반환
function getUseText(useYn) {
  switch (useYn) {
    case "1":
      return "Y";
    case "2":
      return "N";
    default:
      return "";
  }
}

function Main() {
  // 상태 변수 정의
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [shipmentPlan, setShipmentPlan] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedTdIndex, setSelectedTdIndex] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [check, setCheck] = useState(false);

  const [newCustomerData, setNewCustomerData] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    useYn: "1",
  });

  // "추가" 아이콘을 클릭했을 때 실행되는 함수
  const [formData, setFormData] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    shipmentYn: "",
    telNo: "",
    faxNo: "",
    postNo: "",
    addStd: "",
    addDtl: "",
    manNm: "",
    manTelNo: "",
    invoiceMail: "",
    useYn: "",
  });

  const [errors, setErrors] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    shipmentYn: "",
    telNo: "",
    faxNo: "",
    postNo: "",
    addStd: "",
    addDtl: "",
    manNm: "",
    manTelNo: "",
    invoiceMail: "",
    useYn: "",
  });

  // API 엔드포인트 및 URL 정의
  const serverUrl = "http://133.186.221.46:8090/";
  const commonCodeApiEndpoint = "test/api/commonCode";
  const customerApiEndpoint = "test/api/search/customer";
  const commonCodeUrl = `${serverUrl}${commonCodeApiEndpoint}`;
  const customerUrl = `${serverUrl}${customerApiEndpoint}`;

  // 테이블 컬럼 정의
  const columns = [
    { headerName: "번호", field: "number" },
    { headerName: "고객사코드", field: "custCd" },
    { headerName: "고객사명", field: "custNm" },
    { headerName: "지역", field: "regionCd" },
    { headerName: "정산방법", field: "calCd" },
    { headerName: "사용여부", field: "useYn" },
  ];

  // 데이터 조회 함수
  const fetchData = async () => {
    try {
      const [commonCodeResponse, customerResponse] = await Promise.all([
        fetch(commonCodeUrl),
        fetch(customerUrl),
      ]);

      if (!commonCodeResponse.ok || !customerResponse.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const [commonCodeResult, customerResult] = await Promise.all([
        commonCodeResponse.json(),
        customerResponse.json(),
      ]);

      if (
        commonCodeResult.code === "0" &&
        Array.isArray(commonCodeResult.data)
      ) {
        // 공통 코드 데이터 사용
      }

      if (customerResult.code === "0" && Array.isArray(customerResult.data)) {
        setRowData(customerResult.data);
      }
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    }
  };

  // 데이터 조회 함수
  const list = async () => {
    try {
      // 필터링할 조건을 담을 변수
      const filters = {};

      // 각 필터링 항목에 대한 검사 및 설정
      if (searchParams.regionCd !== "") {
        filters.regionCd = searchParams.regionCd;
      }

      if (searchParams.calCd !== "") {
        filters.calCd = searchParams.calCd;
      }

      if (searchParams.useYn !== "") {
        filters.useYn = searchParams.useYn;
      }

      // 검색어가 입력된 경우에만 추가
      if (searchParams.custNm) {
        filters.custNm = searchParams.custNm;
      }

      const response = await fetch(customerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0" && Array.isArray(result.data)) {
        setRowData(result.data);
        setIsReady(true);
      }
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    }
  };

  // 검색 파라미터 변경 핸들러
  const handleSearchParamsChange = (field, value) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [field]: value,
    }));
  };

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    list();
  };

  // 사용 여부 체크박스 변경 핸들러
  const handleUseYnCheckboxChange = (rowIndex) => {
    const updatedRowData = [...rowData];
    const toggledState = updatedRowData[rowIndex].useYn === "1" ? "2" : "1";
    updatedRowData[rowIndex].useYn = toggledState;
    updatedRowData[rowIndex].__changed = true;

    setRowData(updatedRowData);
  };

  // 테이블 행 클릭 핸들러
  const handleTableRowClick = async (dataRow) => {
    try {
      console.log("formData:::", formData);

      const detailUrl = `${serverUrl}test/api/search/customer/detail`;
      const requestBody = { custCd: dataRow.custCd };

      const response = await fetch(detailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0" && result.data) {
        console.log("result.data:::", result.data);
        setSelectedCustomer(result.data);
      }
    } catch (error) {
      console.error("상세정보를 불러오는 중 오류 발생:", error);
    }
  };

  // 체크박스 상태 저장 함수
  const saveCheckboxState = async (custCd, useYn) => {
    try {
      const saveUrl = `${serverUrl}test/api/save/custUseYn`;

      const requestBody = {
        data: [],
      };

      const saveData = rowData
        .filter((row) => row.__changed)
        .map((row) => {
          delete row.calCd;
          delete row.custNm;
          delete row.regionCd;
          delete row.__changed;

          return row;
        });

      requestBody.data = saveData;

      const response = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0") {
        list();
      }
    } catch (error) {
      console.error("체크박스 상태 저장 중 오류:", error);
    }
  };

  // 입력 필드의 값이 변경될 때마다 호출되는 함수
  const handleInputChange = (event) => {
    if (event) {
      const { name, value } = event.target;
      setFormData({
        ...formData,
        [name]: value,
        // __changed: true,
      });

      return event.target.value;
    }
  };

  // 회원가입 양식 제출 처리
  const handleAdd = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 유효성 검사
    if (formData.custNm.length === 0) {
      newErrors.custNm = "필수입력해야합니다";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // 유효성 검사 통과 시, 새로운 행 추가
        const newRow = {
          saveType: 0,
          custCd: formData.custCd,
          custNm: formData.custNm,
          regionCd: formData.regionCd,
          calCd: formData.calCd,
          shipmentYn: formData.shipmentYn,
          telNo: formData.telNo,
          faxNo: formData.faxNo,
          postNo: formData.postNo,
          addStd: formData.addStd,
          addDtl: formData.addDtl,
          manNm: formData.manNm,
          manTelNo: formData.manTelNo,
          invoiceMail: formData.invoiceMail,
          useYn: formData.useYn,
        };

        console.log("isReady:::", isReady);
        // Data를 불러온 상태일 때만 실행
        if (isReady) {
          // rowData에 새로운 행 추가
          setRowData((prevRowData) => [...prevRowData, newRow]);

          // 서버에 데이터 저장
          const saveUrl = `${serverUrl}test/api/save/customer`;
          let addData;

          if (selectedCustomer) {
            // 기존 데이터가 있을 경우 (수정)
            addData = { ...selectedCustomer, saveType: 2 };
          } else {
            // 기존 데이터가 없을 경우 (신규 등록)
            addData = { ...newRow, saveType: 1 };
          }

          const requestBody = addData;

          const response = await fetch(saveUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error("서버 응답이 올바르지 않습니다");
          }

          const result = await response.json();

          if (result.code === "0") {
            // 추가 후에 입력 폼 초기화
            setFormData({
              custCd: "",
              custNm: "",
              regionCd: "",
              calCd: "",
              shipmentYn: "",
              telNo: "",
              faxNo: "",
              postNo: "",
              addStd: "",
              addDtl: "",
              manNm: "",
              manTelNo: "",
              invoiceMail: "",
              useYn: "",
            });

            console.log("고객사가 추가되었습니다.");
            list(); // 테이블 갱신
          } else {
            console.error("고객사 추가 중 오류 발생:", result.message);
          }
        } else {
          alert("데이터를 불러온 다음 실행해 주세요!");
        }
      } catch (error) {
        console.error("고객사 추가 중 오류 발생:", error);
      }
    }
  };

  // "수정" 버튼 클릭 시 실행되는 함수
  const handleCorrection = async () => {
    try {
      const saveUrl = `${serverUrl}test/api/save/customer`;

      let requestBody = {};

      if (selectedCustomer) {
        // 기존 데이터가 있을 경우 (수정)
        requestBody = { ...selectedCustomer, saveType: 2 };
      } else {
        // 기존 데이터가 없을 경우 (신규 등록)
        requestBody = { ...newCustomerData, saveType: 1 };
      }

      // const requestBody = saveData;
      console.log("requestBody:::", requestBody);
      console.log("formData:::", formData);

      const response = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("서버 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0") {
        console.log(`${selectedCustomer ? "수정" : "추가"}되었습니다.`);
        // 테이블 데이터 갱신
        const updatedRowData = [...rowData];

        if (selectedCustomer) {
          // 기존 데이터가 있을 경우 (수정)
          const updatedIndex = updatedRowData.findIndex(
            (row) => row.custCd === selectedCustomer.custCd
          );
          updatedRowData[updatedIndex] = result.data; // 수정된 데이터로 교체
        } else {
          // 기존 데이터가 없을 경우 (신규 등록)
          updatedRowData.push(result.data); // 신규 등록된 데이터 추가
        }

        setRowData(updatedRowData);

        list(); // 테이블 갱신
      }
    } catch (error) {
      console.error("고객사 처리 중 오류 발생:", error);
    }
  };

  // user-information
  const [userInformation, setUserInformation] = useState({
    regionCd: "",
    calCd: "",
  });

  const handleUserInformationChange = (field, value) => {
    setUserInformation((prevUserInformation) => ({
      ...prevUserInformation,
      [field]: value,
    }));
  };

  // 종료 버튼 클릭 핸들러
  const handleExitClick = () => {
    if (window.confirm("정말로 종료하시겠습니까?")) {
      window.close();
    }
  };

  return (
    <div className="App">
      {/* 상단 바 */}
      <div className="first">
        <div className="first-1">비즈위즈시스템</div>
        <div className="first-2">
          <i
            className="fa-solid fa-circle-user"
            style={{ marginRight: "10px" }}
          ></i>
          안민별
          <i
            className="fa-solid fa-right-from-bracket"
            style={{ marginLeft: "60px", cursor: "pointer" }}
            onClick={handleExitClick}
          ></i>
        </div>
      </div>

      {/* 검색 및 조회 영역 */}
      <div className="second">
        <div
          className="second-1"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* 드롭다운 메뉴 */}
          <div
            className="dropdown"
            style={{ display: "inline-block", position: "relative" }}
          >
            <i
              className="fa-solid fa-bars"
              style={{ marginRight: "30px", cursor: "pointer" }}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            ></i>
            {isDropdownOpen && (
              <div
                className="dropdown-content"
                style={{
                  position: "absolute",
                  backgroundcolor: "#f1f1f1",
                  minWidth: "160px",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              >
                <p style={{ padding: "12px 16px", margin: 0 }}>고객사 관리</p>
              </div>
            )}
          </div>
          {/* 고객사 관리 제목 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "20px" }}>고객사 관리</div>
          </div>
        </div>
        {/* 조회 버튼 및 저장 버튼 */}
        <div className="second-2">
          <button className="second-button" onClick={handleSearchClick}>
            조회
          </button>
          <button
            className="second-button"
            onClick={() => {
              if (selectedCustomer) {
                saveCheckboxState(
                  selectedCustomer.custCd,
                  selectedCustomer.useYn
                );
              }
            }}
          >
            저장
          </button>
        </div>
      </div>

      {/* 검색 조건 입력 영역 */}
      <div className="third">
        <div className="third-box1">
          지역
          <select
            className="third-select"
            value={searchParams?.regionCd || ""}
            onChange={(e) =>
              handleSearchParamsChange("regionCd", e.target.value)
            }
          >
            <option value="">전체</option>
            <option value="1">도내</option>
            <option value="2">도외</option>
            <option value="3">기타</option>
          </select>
        </div>
        <div className="third-box2">
          정산방법
          <select
            className="third-select"
            value={searchParams.calCd || ""}
            onChange={(e) => handleSearchParamsChange("calCd", e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">고산농협</option>
            <option value="2">직접정산</option>
            <option value="3">기타</option>
          </select>
        </div>
        <div className="third-input">
          고객사명
          <input
            type="text"
            placeholder="고객사명 입력"
            style={{ marginLeft: "10px", width: "15vw", height: "30px" }}
            onChange={(e) => handleSearchParamsChange("custNm", e.target.value)}
          />
        </div>
        <div className="third-box3">
          사용여부
          <select
            className="third-select"
            value={searchParams.useYn || ""}
            onChange={(e) => handleSearchParamsChange("useYn", e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">Y</option>
            <option value="2">N</option>
          </select>
        </div>
      </div>

      {/* 테이블 및 상세정보 영역 */}
      <div className="boxes">
        {/* 테이블 */}
        <div className="box1">
          <div className="box1-title">고객사 목록</div>
          <div>
            <table className="table-container">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.field}>{col.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ height: "60vh", border: "1px solid gray" }}>
                {rowData === null ? (
                  <tr>
                    <td colSpan={columns.length}>데이터가 없습니다.</td>
                  </tr>
                ) : (
                  rowData.map((dataRow, rowIndex) => {
                    return (
                      <tr
                        key={rowIndex}
                        onClick={() => handleTableRowClick(dataRow)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{rowIndex + 1}</td>
                        <td>{dataRow.custCd}</td>
                        <td>{dataRow.custNm}</td>
                        <td>{getRegionText(parseInt(dataRow.regionCd))}</td>
                        <td>{getCalText(parseInt(dataRow.calCd))}</td>
                        <td>
                          <input
                            type="checkbox"
                            id={`useYnCheckbox_${rowIndex}`}
                            checked={dataRow.useYn === "1"}
                            onChange={() => handleUseYnCheckboxChange(rowIndex)}
                          />
                          <label htmlFor={`useYnCheckbox_${rowIndex}`}>
                            {getUseText(parseInt(dataRow.useYn))}
                          </label>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="box2">
          <div className="box2-line">
            <div className="box2-title">고객사 상세정보</div>
            <div>
              <i
                className="fa-solid fa-plus"
                style={{ marginRight: "20px", cursor: "pointer" }}
                onClick={handleAdd}
              ></i>
              <i
                className="fa-regular fa-floppy-disk"
                style={{ cursor: "pointer" }}
                onClick={handleCorrection}
              ></i>
            </div>
          </div>
          {/*고객사 상세정보 */}
          <div className="user-information">
            {
              <>
                <div className="user" style={{ marginTop: "2vh" }}>
                  고객사코드
                  <input
                    type="text"
                    className="user-input"
                    backgroundcolor="#FFCCCC"
                    value={
                      selectedCustomer ? selectedCustomer.custCd : undefined
                    }
                    readOnly // 수정 불가능하도록 설정
                    name="custCd"
                  />
                </div>
                <div className="user">
                  고객사명
                  <input
                    type="text"
                    name="custNm"
                    placeholder="고객사명 입력"
                    className="user-input"
                    value={handleInputChange()}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  지역
                  <select
                    className="user-select"
                    name="regionCd"
                    value={userInformation.regionCd}
                    onChange={(e) =>
                      handleUserInformationChange("regionCd", e.target.value)
                    }
                    required
                  >
                    <option value="1">도내</option>
                    <option value="2">도외</option>
                    <option value="3">기타</option>
                  </select>
                </div>
                <div className="user">
                  정산방법
                  <select
                    name="calCd"
                    className="user-select"
                    value={
                      selectedCustomer ? selectedCustomer.calCd : undefined
                    }
                    onChange={(e) =>
                      handleUserInformationChange("calCd", e.target.value)
                    }
                    required
                  >
                    <option value="1">고산농협</option>
                    <option value="2">직접정산</option>
                    <option value="3">기타</option>
                  </select>
                </div>
                <div className="user">
                  출하계획
                  <div
                    style={{
                      border: "1px solid black",
                      padding: "7px",
                      width: "300px",
                      backgroundColor: "#ffff",
                      display: "flex",
                      marginRight: "3vw",
                    }}
                  >
                    <div style={{ marginLeft: "50px", marginRight: "50px" }}>
                      <input
                        name="shipmentYn"
                        type="checkbox"
                        id="shipmentPlanCheckbox"
                        checked={
                          selectedCustomer
                            ? selectedCustomer.shipmentYn === "Y"
                              ? true
                              : false
                            : false
                        }
                        onChange={(e) => {
                          console.log("selectedCustomer", selectedCustomer);
                          setShipmentPlan(e.target.checked);
                        }}
                        required
                      />
                      <label htmlFor="shipmentPlanCheckbox">사용</label>
                    </div>
                    <div>
                      <input
                        name="shipmentYn"
                        type="checkbox"
                        id="noShipmentPlanCheckbox"
                        checked={
                          selectedCustomer
                            ? selectedCustomer.shipmentYn === "Y"
                              ? false
                              : true
                            : false
                        }
                        onChange={(e) => setShipmentPlan(!e.target.checked)}
                      />
                      <label htmlFor="noShipmentPlanCheckbox">미사용</label>
                    </div>
                  </div>
                </div>
                <div className="user">
                  전화번호
                  <input
                    name="telNo"
                    type="tel"
                    placeholder="전화번호 입력 (예: 010-1234-5678)"
                    required
                    pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                    maxLength="13"
                    className="user-input"
                    value={
                      selectedCustomer ? selectedCustomer.telNo : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  팩스번호
                  <input
                    name="faxNo"
                    type="tel"
                    placeholder="팩스번호 입력"
                    className="user-input"
                    value={
                      selectedCustomer ? selectedCustomer.faxNo : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  우편번호
                  <input
                    name="postNo"
                    type="tel"
                    placeholder="우편번호 입력"
                    className="user-input"
                    maxLength="5"
                    style={{ position: "relative" }}
                    value={
                      selectedCustomer ? selectedCustomer.postNo : undefined
                    }
                    onChange={handleInputChange}
                  />
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      right: "150px",
                    }}
                  ></i>
                </div>
                <div className="user">
                  기본주소
                  <input
                    name="addStd"
                    type="text"
                    placeholder="기본주소 입력"
                    className="user-input"
                    value={
                      selectedCustomer ? selectedCustomer.addStd : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  상세주소
                  <input
                    name="addDtl"
                    type="text"
                    placeholder="상세주소 입력"
                    className="user-input"
                    value={
                      selectedCustomer ? selectedCustomer.addDtl : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  담당자
                  <input
                    name="manNm"
                    type="text"
                    placeholder="담당자 성함 입력"
                    className="user-input"
                    value={
                      selectedCustomer ? selectedCustomer.manNm : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  담당자연락처
                  <input
                    name="manTelNo"
                    type="tel"
                    placeholder="담당자 연락처 입력(예: 010-1234-5678)"
                    className="user-input"
                    pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                    maxLength="13"
                    value={
                      selectedCustomer ? selectedCustomer.manTelNo : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="user">
                  계산서수취메일
                  <input
                    type="text"
                    name="invoiceMail"
                    placeholder="계산서수취메일 입력"
                    className="user-input"
                    value={
                      selectedCustomer
                        ? selectedCustomer.invoiceMail
                        : undefined
                    }
                    onChange={handleInputChange}
                  />
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
