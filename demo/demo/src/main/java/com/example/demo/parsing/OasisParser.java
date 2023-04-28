package com.example.demo.parsing;

import com.example.demo.data.*;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.NodeFilter;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;


class EmptyTextFilter implements NodeFilter {
    public NodeFilter.FilterResult head(Node node, int depth) {

        if (node instanceof TextNode && ((TextNode) node).isBlank())
            return NodeFilter.FilterResult.REMOVE; // Removes any text nodes that are blank

        return NodeFilter.FilterResult.CONTINUE; // and keeps everything else.
    }
}


enum RowType {
    TITLE,
    HEADER,
    CONTENT;

    static RowType fromNode(Node rowNode) throws IllegalArgumentException {

        Node firstColNode = rowNode.firstChild();
        if (firstColNode == null) {
            throw new IllegalArgumentException("Row node contains no columns");
        }

        String columnType = firstColNode.attr("class");
        switch (columnType) {
            case "ddtitle":
                return RowType.TITLE;
            case "ddheader":
                return RowType.HEADER;
            case "dddefault":
                return RowType.CONTENT;
            default:
                throw new IllegalArgumentException("Passed node does not contain valid columns or is not a row.");
        }
    }
}

public class OasisParser {

    // Recursively extract the text of a node and its children
    public static String extractString(Node node) {
        if (node instanceof TextNode) {
            return ((TextNode) node).text();
        }

        String childrenResult = "";

        for (Node childNode : node.childNodes()) {
            childrenResult += extractString(childNode);
        }

        return childrenResult;
    }

    public static boolean notApplicableString(String str) {
        return str.contains("N/A") || str.contains("TBA");
    }

    public static String getDepartment(Node rowNode) {
        // We're going to assume that if this is called rowNode is title row (contains a nested TextNode with a department)
        String dirtyTitle = extractString(rowNode); // Title from node that may contain suffix: "***Continued***"

        int contIndex = dirtyTitle.indexOf("***");
        if (contIndex == -1) // If dirtyTitle doesn't have the *** suffix we can just return it
            return dirtyTitle;

        return dirtyTitle.substring(0, contIndex - 1); // otherwise we cut out the suffix and return
    }

    public static LocalTime parseTimeFromMorningAfternoonRep(String str) {

        if (notApplicableString(str))
            return null;

        String[] timeParts = str.trim().split(" ");

        LocalTime time = LocalTime.parse(timeParts[0]);

        if (timeParts[1].toUpperCase(Locale.ROOT).equals("PM") && time.getHour() != 12) {
            return time.plusHours(12);
        }

        return time;
    }

    public static boolean isAdditionalMeetingRow(Node row) {
        if (row.childNodeSize() < 7) {
            return false;
        }

        String titleString = extractString(row.childNode(6));

        if (titleString.length() <= 1)
            return true;

        return false;
    }

    public static void populateMeetings(List<Meeting> meetings, Node meetingRow) {

        String days = extractString(meetingRow.childNode(10));

        int spanOffset = meetingRow.childNodeSize() - 20;

        String[] timeStrings = extractString(meetingRow.childNode(11 + spanOffset)).split("-");
        LocalTime startTime = parseTimeFromMorningAfternoonRep(timeStrings[0]);

        LocalTime endTime = (startTime == null) ? null : parseTimeFromMorningAfternoonRep(timeStrings[1]);

        String campus = extractString(meetingRow.childNode(17 + spanOffset));
        String[] locationStrings = extractString(meetingRow.childNode(18 + spanOffset)).trim().split(" ");

        Location meetingLoc;

        if (notApplicableString(locationStrings[0]) || locationStrings[0].contains("OFF") || locationStrings.length < 2) {
            meetingLoc = null;
        } else {
            meetingLoc = new Location(null, campus, locationStrings[0], locationStrings[1]);
        }


        meetings.add(new Meeting(null, startTime, endTime, days, meetingLoc));

        Node nextRow = meetingRow.nextSibling();
        if (nextRow != null && isAdditionalMeetingRow(nextRow))
            populateMeetings(meetings, nextRow);


    }

    public static int extractLowerCredits(String credString) {

        int firstDecimalIndex = credString.indexOf(".");
        if (firstDecimalIndex != -1) {
            credString = credString.substring(0, firstDecimalIndex);
        }

        return Integer.parseInt(credString);
    }

    public static LocalDate parseDateWithArbitraryYear(String dateString) {
        String[] monthDay = dateString.split("/");
        return LocalDate.of(2023, Integer.parseInt(monthDay[0]), Integer.parseInt(monthDay[1]));
    }

    record InstructorsParseResult(Instructor primary, Instructor[] all) {
    }

    public static InstructorsParseResult parseInstructors(String[] instructorStrings) {

        Instructor primary = null;
        Instructor[] allIns = new Instructor[instructorStrings.length];
        for (int i = 0; i < allIns.length; i++) {
            Instructor currIns;
            int primaryIndicator = instructorStrings[i].indexOf("(P)");
            if (primaryIndicator >= 0) {
                currIns = new Instructor(
                        instructorStrings[i].substring(0, primaryIndicator).trim()
                );
                primary = currIns;
            } else {
                currIns = new Instructor(
                        instructorStrings[i].trim()
                );
            }
            allIns[i] = currIns;
        }

        return new InstructorsParseResult(primary, allIns);
    }

    public static List<String> parseAttributes(String[] attributeStrings) {

        List<String> allAtrib = new ArrayList<>(attributeStrings.length);
        for (String atrib : attributeStrings) {
            allAtrib.add(atrib.trim());
        }

        return allAtrib;
    }

    record SectionResult(Section sec, int numMeets) {
    }

    public static SectionResult getSection(Node rowNode, String department) {

        String crn = extractString(rowNode.childNode(1));
        String subject = extractString(rowNode.childNode(2));
        String courseNumber = extractString(rowNode.childNode(3));
        String sectionNumber = extractString(rowNode.childNode(4));
        int credits = extractLowerCredits(extractString(rowNode.childNode(5)));
        String courseTitle = extractString(rowNode.childNode(6));
        String method = extractString(rowNode.childNode(7));
        boolean permitRequired = extractString(rowNode.childNode((8))).length() != 0;

        String[] dateStrings = extractString(rowNode.childNode(9)).split("-");
        LocalDate startDate = parseDateWithArbitraryYear(dateStrings[0]);
        LocalDate endDate = parseDateWithArbitraryYear(dateStrings[1]);

        List<Meeting> meetings = new ArrayList<>();
        populateMeetings(meetings, rowNode);


        int spanOffset = rowNode.childNodeSize() - 20;

        int seatCap = Integer.parseInt(extractString(rowNode.childNode(12 + spanOffset)));
        int seatAvail = Integer.parseInt(extractString(rowNode.childNode(13 + spanOffset)));
        int waitCap = Integer.parseInt(extractString(rowNode.childNode(14 + spanOffset)));
        int waitAvail = Integer.parseInt(extractString(rowNode.childNode(15 + spanOffset)));

        InstructorsParseResult instructorsResults = parseInstructors(extractString(rowNode.childNode(16 + spanOffset)).split(","));

        List<String> attributesResults = parseAttributes(extractString(rowNode.childNode(19 + spanOffset)).split("and"));

        Course course = new Course(subject, courseNumber, courseTitle, credits, department, permitRequired, new HashSet<>(attributesResults));


        return new SectionResult(new Section(crn, course, sectionNumber, startDate, endDate, waitAvail, waitCap, seatAvail, seatCap, method, instructorsResults.primary(), Set.of(instructorsResults.all()), new HashSet<>(meetings)), meetings.size());


    }


    public static Document createHTMLDocFromFile(File file) throws IOException {

        return Jsoup.parse(file, "UTF-8", "");
    }

    public static Node getCleanTableBody(Document fromDoc) {

        Element parentTable = fromDoc.select("table[summary='This layout table is used to present the sections found']").first();

        parentTable.filter(new EmptyTextFilter()); // Clears out any empty text nodes that have been picked up.

        return parentTable.childNode(1); // Gets the table body node from the "table".
    }

    public static List<Section> parseSectionsFromDocument(Document sectionDoc) {


        List<Section> sections = new ArrayList<>();

        Node tableBody = getCleanTableBody(sectionDoc);


        String activeDepartment = "";

        for (int i = 0; i < tableBody.childNodeSize(); i++) {
            Node rowNode = tableBody.childNode(i);
            RowType rowType = RowType.fromNode(rowNode);

            switch (rowType) {
                case TITLE:
                    activeDepartment = getDepartment(rowNode);
                    break;
                case CONTENT:
                    SectionResult result = getSection(rowNode, activeDepartment);
                    sections.add(result.sec());
                    i += (result.numMeets() - 1); // Skip rows that have been processed for meetings
                    break;
                case HEADER: // Header rows are all identical, no information needs processing
                    break;
                default:
                    break;
            }

        }

        return sections;
    }

}