package org.ecocean.servlet;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.ParseException;
import java.util.*;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.ecocean.Shepherd;
import org.ecocean.Encounter;
import org.ecocean.CommonConfiguration;
import org.ecocean.media.MediaAsset;
import org.ecocean.mmutil.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servlet to process/display MantaMatcher algorithm results.
 *
 * @author Giles Winstanley
 */
public final class MantaMatcher extends DispatchServlet {
  private static final long serialVersionUID = 1L;
  /** SLF4J logger instance for writing log entries. */
  private static final Logger log = LoggerFactory.getLogger(MantaMatcher.class);
  /** Parameter key for referencing MMA results data. */
  public static final String PARAM_KEY_SPV = "spv";
  /** Parameter key for referencing MMA results data. */
  public static final String PARAM_KEY_SCANID = "scanid";
  /** Request key for referencing MMA scan data. */
  public static final String REQUEST_KEY_SCAN = "mma-scan";
  /** Request key for referencing MMA results data. */
  public static final String REQUEST_KEY_RESULTS = "mma-results";
  /** Path for referencing JSP page for error display. */
  private static final String JSP_ERROR = "/error_generic.jsp";
  /** Path for referencing JSP page for MMA results display. */
  private static final String JSP_MMA_RESULTS = "/encounters/mmaResults.jsp";

  @Override
  public void init() throws ServletException {
    super.init();
    try {
      registerMethodGET("displayResults");
      //registerMethodPOST("displayResults");
      registerMethodPOST("resetMmaCompatible", "deleteAllOrphanMatcherFiles");
    }
    catch (DelegateNotFoundException ex) {
      throw new ServletException(ex);
    }
  }

  @Override
  public String getServletInfo() {
    int y = Calendar.getInstance().get(Calendar.YEAR);
    return String.format("MantaMatcher, Copyright 2014-%d Giles Winstanley / Wild Book / wildme.org", y);
  }

  @Override
  protected void handleDelegateNotFound(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    res.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported delegate method specified.");
  }

  private void handleException(HttpServletRequest req, HttpServletResponse res, Throwable t) throws ServletException, IOException {
    log.warn(t.getMessage(), t);
    t = t.getCause();
    while (t != null) {
      log.warn("\tCaused by: " + t.getMessage(), t);
      t = t.getCause();
    }
    req.setAttribute("javax.servlet.jsp.jspException", t);
    getServletContext().getRequestDispatcher(JSP_ERROR).forward(req, res);
  }

  public void displayResults(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    System.out.println("...Welcome to displayResults!");
    Shepherd myShepherd = new Shepherd(ServletUtilities.getContext(req));
    myShepherd.setAction("MantaMatcher.displayResults");
    myShepherd.beginDBTransaction();
    try {
      // Parse SPV for which to get MantaMatcher algorithm results.
      String num = req.getParameter(PARAM_KEY_SPV);
      if (num == null || "".equals(num.trim())) {
        throw new IllegalArgumentException("Invalid MediaAsset specified");
      }
      System.out.println("...Num is fine!");
      // Parse unique results ID.
      String id = req.getParameter(PARAM_KEY_SCANID);
      if (id == null || "".equals(id.trim())) {
        throw new IllegalArgumentException("Invalid results ID specified");
      }
      System.out.println("...ID is fine!");

      String context="context0";
      context=ServletUtilities.getContext(req);
      
      
      //myShepherd.beginDBTransaction();
      //myShepherd.setAction("MantaMatcher.java");
      MediaAsset ma = myShepherd.getMediaAsset(num);
      if (ma == null) {
        throw new IllegalArgumentException("Invalid MediaAsset specified: " + num);
      }
      System.out.println("...MediaAsset is fine!");

      MantaMatcherScan scan = MantaMatcherUtilities.findMantaMatcherScan(context,ma , id);
      MMAResultsProcessor.MMAResult mmaResults = parseResults(req, scan.getScanOutputTXT(), ma);
      if(mmaResults==null)System.out.println("mmaResults is NULL!!");
      req.getSession().setAttribute(REQUEST_KEY_SCAN, scan);
      req.getSession().setAttribute(REQUEST_KEY_RESULTS, mmaResults);
      //req.getSession().setAttribute("encId", request);
      
      //getServletContext().getRequestDispatcher(JSP_MMA_RESULTS).forward(req, res);
      
      String name = "Jane"; //create a string

      RequestDispatcher rs = req.getRequestDispatcher(JSP_MMA_RESULTS); //the page you want to send your value
      rs.forward(req,res); //forward it
      

    } catch (Exception ex) {
      ex.printStackTrace();
      handleException(req, res, ex);
    }
    finally{
      myShepherd.rollbackDBTransaction();
      myShepherd.closeDBTransaction();
    }
  }

  private MMAResultsProcessor.MMAResult parseResults(HttpServletRequest req, File mmaResults, MediaAsset ma)
          throws IOException, ParseException {
    assert ma != null;
    assert mmaResults != null;
    System.out.println("...welcome to parseResults!");
    String context="context0";
    context=ServletUtilities.getContext(req);

    // Derive data folder info.
    String rootDir = getServletContext().getRealPath("/");
    File dataDir = new File(ServletUtilities.dataDir(context, rootDir));
    System.out.println("...I think my dataDIr is at: "+ServletUtilities.dataDir(context, rootDir));
    // Parse MantaMatcher results files ready for display.
    Shepherd myShepherd = new Shepherd(context);
    myShepherd.beginDBTransaction();
    try {
      // Load results file.
      System.out.println("...about to loadFile: "+mmaResults.getAbsolutePath());
      if(mmaResults.exists())System.out.println("...better yet, it exists!");
      String text = new String(FileUtilities.loadFile(mmaResults));
      // Parse results.
      System.out.println("...about to parseMatchResults!");
      return MMAResultsProcessor.parseMatchResults(myShepherd, text, ma, dataDir);
    }
    catch(Exception e){
      e.printStackTrace();
    }
    finally {
      myShepherd.rollbackDBTransaction();
      myShepherd.closeDBTransaction();
    }
    System.out.println("parseResults is NULL!!!!");  
    return null;
  }

  public void resetMmaCompatible(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    String context="context0";
    context = ServletUtilities.getContext(req);
    Shepherd shepherd = new Shepherd(context);
    File dataDir = new File(ServletUtilities.dataDir(context, getServletContext().getRealPath("/")));

    try {

      // Perform MMA-compatible flag updates.
      int ok = 0, changed = 0, failed = 0;
      shepherd.beginDBTransaction();
      for (Iterator iter = shepherd.getAllEncounters(); iter.hasNext();) {
        Encounter enc = (Encounter)iter.next();
        boolean hasCR = MantaMatcherUtilities.checkEncounterHasMatcherFiles(enc, dataDir);
        boolean encCR = enc.getMmaCompatible();
        if ((hasCR && encCR) || (!hasCR && !encCR)) {
          ok++;
        }
        else {
          try {
            enc.setMmaCompatible(hasCR);
            changed++;
          }
          catch (Exception ex) {
            failed++;
            log.warn("Failed to set MMA-compatible flag for encounter: " + enc.getCatalogNumber(), ex);
          }
        }
      }
      shepherd.commitDBTransaction();
      shepherd.closeDBTransaction();

      // Write output to response.
      res.setCharacterEncoding("UTF-8");
      res.setContentType("text/html; charset=UTF-8");
      PrintWriter out = res.getWriter();
      out.println(ServletUtilities.getHeader(req));

      if (failed > 0) {
        out.println(String.format("<strong>Failure!</strong> I failed to reset all the MMA-compatibility flags; %d failed to update, %d were updated successfully, and %d were already correct.", failed, changed, ok));
      } else {
        out.println(String.format("<strong>Success!</strong> I have successfully reset the MMA-compatibility flag for %d encounters (%d were already correct).", changed, ok));
      }

      out.println("<p><a href=\"http://" + CommonConfiguration.getURLLocation(req) + "/appadmin/admin.jsp\">Return to the Administration page.</a></p>\n");
      out.println(ServletUtilities.getFooter(context));

      out.flush();
      out.close();

    } catch (Exception ex) {
      shepherd.rollbackDBTransaction();
      shepherd.closeDBTransaction();
      handleException(req, res, ex);
    }
  }

  // Admin utility method to scan encounters & their data folders for
  // orphaned files relating to the MantaMatcher algorithm, and delete them.
  public void deleteAllOrphanMatcherFiles(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    String context="context0";
    context = ServletUtilities.getContext(req);
    Shepherd myShepherd = new Shepherd(context);
    myShepherd.beginDBTransaction();
    File dataDir = new File(ServletUtilities.dataDir(context, getServletContext().getRealPath("/")));
    // Format string for encounter page URL (with placeholder).
    String pageUrlFormatEnc = "//" + CommonConfiguration.getURLLocation(req) + "/encounters/encounter.jsp?number=%s";

    Map<File, String> files = new TreeMap<>();
    Map<File, String> failed = new TreeMap<>();

    try {
      // Perform MMA-compatible flag updates.
      myShepherd.beginDBTransaction();
      for (Iterator iter = myShepherd.getAllEncounters(); iter.hasNext();) {
        Encounter enc = (Encounter)iter.next();
        File dir = new File(enc.dir(dataDir.getAbsolutePath()));
        if (dir == null || !dir.exists())
          continue;

        // Collate files to be checked.
        RegexFilenameFilter ff1 = new RegexFilenameFilter("^.+_(CR|EH|FT)\\." + MediaUtilities.REGEX_SUFFIX_FOR_WEB_IMAGES);
        RegexFilenameFilter ff2 = new RegexFilenameFilter("^.+\\.FEAT$");
        RegexFilenameFilter ff3 = new RegexFilenameFilter("^.+_mma(In|Out)put(Regional)?\\.(txt|csv)$");
        File[] fileList = dir.listFiles(ff1);
        if (fileList != null) {
          for (File f : Arrays.asList(fileList))
            files.put(f, enc.getCatalogNumber());
        }
        fileList = dir.listFiles(ff2);
        if (fileList != null) {
          for (File f : Arrays.asList(fileList))
            files.put(f, enc.getCatalogNumber());
        }
        fileList = dir.listFiles(ff3);
        if (fileList != null) {
          for (File f : Arrays.asList(fileList))
            files.put(f, enc.getCatalogNumber());
        }

        // Remove matcher files relating to existing SPVs.
        for (MediaAsset ma : enc.getMedia()) {
          File file=new File(enc.subdir()+File.separator+ma.getFilename());
          if (!MediaUtilities.isAcceptableImageFile(file)) {
            continue;
          }
          Map<String, File> mmFiles = MantaMatcherUtilities.getMatcherFilesMap(ma);
          File cr = mmFiles.get("CR");
          if (cr.exists()) {
            for (File f : mmFiles.values())
              files.remove(f);
          }
        }

        // Delete orphan files.
        for (Map.Entry<File, String> me : files.entrySet()) {
          if (me.getKey().exists() && !me.getKey().delete()) {
            failed.put(me.getKey(), me.getValue());
          }
        }
      }

      // Write output to response.
      res.setCharacterEncoding("UTF-8");
      res.setContentType("text/html; charset=UTF-8");
      try (PrintWriter out = res.getWriter()) {
        out.println(ServletUtilities.getHeader(req));

        if (!failed.isEmpty()) {
          out.println(String.format("<strong>Failure!</strong> I failed to delete all orphan MantaMatcher algorithm files (%2$d of %1$d couldn't be deleted).", files.size(), failed.size()));
        } else {
          out.println(String.format("<strong>Success!</strong> I have successfully deleted all orphan MantaMatcher algorithm files (%d were found).", files.size()));
        }

        out.println("<ul class=\"adminToolDetailList\">");
        for (Map.Entry<File, String> me : files.entrySet()) {
          File f = me.getKey();
          String encNum = me.getValue();
          String url = String.format(pageUrlFormatEnc, encNum);
          if (failed.containsKey(me.getKey())) {
            out.println(String.format("<li>Failed to delete file: %s (<a href=\"%s\">%s</a>)</li>", f.getName(), url, encNum));
          } else {
            out.println(String.format("<li>Successfully deleted file: %s (<a href=\"%s\">%s</a>)</li>", f.getName(), url, encNum));
          }
        }
        out.println("</ul>");

        out.println("<p><a href=\"http://" + CommonConfiguration.getURLLocation(req) + "/appadmin/admin.jsp\">Return to the Administration page.</a></p>\n");
        out.println(ServletUtilities.getFooter(context));
      }

    } 
    catch (Exception ex) {

      handleException(req, res, ex);
      
    }
    finally{
      myShepherd.rollbackDBTransaction();
      myShepherd.closeDBTransaction();
    }
  }
}